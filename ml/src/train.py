"""
StudySense AI - Model Training, Evaluation, and Selection Engine
Trains Linear Regression, Decision Tree, and Random Forest models on real student data.
Saves the best model pipeline and generates evaluation visualizations.
"""

import os
import json
import datetime
import joblib
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Headless backend for server/script rendering
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor

import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from .data_loader import load_dataset
    from .preprocessing import create_preprocessor, get_feature_names_out
    from .evaluate import (
        calculate_metrics,
        perform_cross_validation,
        extract_feature_importance,
        format_comparison_table
    )
except ImportError:
    from data_loader import load_dataset
    from preprocessing import create_preprocessor, get_feature_names_out
    from evaluate import (
        calculate_metrics,
        perform_cross_validation,
        extract_feature_importance,
        format_comparison_table
    )

# Output paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
RESULTS_DIR = os.path.join(BASE_DIR, "results")


def generate_evaluation_plots(results, best_model_name, y_test, predictions, feature_names):
    """
    Generate the 3 required evaluation plots and save under ml/results/
    1. Actual vs Predicted Scores
    2. Model Metric Comparison (MAE & RMSE)
    3. Feature Importance for the best model
    """
    os.makedirs(RESULTS_DIR, exist_ok=True)

    # -------------------------------------------------------------------------
    # Plot 1: Actual vs. Predicted Scores for the Best Model
    # -------------------------------------------------------------------------
    plt.figure(figsize=(8, 6))
    best_preds = predictions[best_model_name]
    plt.scatter(y_test, best_preds, color="#4f46e5", alpha=0.6, edgecolors="none", s=40, label="Test Samples")
    
    # Perfect prediction diagonal line
    min_val = min(y_test.min(), best_preds.min())
    max_val = max(y_test.max(), best_preds.max())
    plt.plot([min_val, max_val], [min_val, max_val], color="#ef4444", linestyle="--", linewidth=2, label="Perfect Fit (y = x)")
    
    plt.title(f"Actual vs. Predicted Exam Scores ({best_model_name})", fontsize=13, fontweight="bold", pad=12)
    plt.xlabel("Actual Final Exam Score (0–100)", fontsize=11)
    plt.ylabel("Predicted Final Exam Score (0–100)", fontsize=11)
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.legend(frameon=True)
    plt.tight_layout()
    plot1_path = os.path.join(RESULTS_DIR, "actual_vs_predicted.png")
    plt.savefig(plot1_path, dpi=200)
    plt.close()

    # -------------------------------------------------------------------------
    # Plot 2: Model Metric Comparison (MAE, RMSE, R²)
    # -------------------------------------------------------------------------
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    models = list(results.keys())
    maes = [results[m]["test_metrics"]["mae"] for m in models]
    rmses = [results[m]["test_metrics"]["rmse"] for m in models]
    r2s = [results[m]["test_metrics"]["r2"] for m in models]

    x = np.arange(len(models))
    width = 0.35

    # Subplot 1: Error metrics (Lower is better)
    ax1.bar(x - width/2, maes, width, label="MAE", color="#6366f1")
    ax1.bar(x + width/2, rmses, width, label="RMSE", color="#ec4899")
    ax1.set_ylabel("Score Points Error (Lower is better)", fontsize=10)
    ax1.set_title("Test MAE & RMSE Comparison", fontsize=11, fontweight="bold")
    ax1.set_xticks(x)
    ax1.set_xticklabels(models, rotation=15, ha="right", fontsize=9)
    ax1.grid(True, axis="y", linestyle=":", alpha=0.6)
    ax1.legend()

    # Subplot 2: R² Metric (Higher is better)
    colors = ["#10b981" if m == best_model_name else "#94a3b8" for m in models]
    ax2.bar(models, r2s, color=colors, width=0.5)
    ax2.set_ylabel("R² Variance Explained (Higher is better)", fontsize=10)
    ax2.set_title("Model R² Comparison", fontsize=11, fontweight="bold")
    ax2.set_ylim(0, 1.0)
    ax2.grid(True, axis="y", linestyle=":", alpha=0.6)
    for i, v in enumerate(r2s):
        ax2.text(i, v + 0.02, f"{v:.3f}", ha="center", fontsize=9, fontweight="bold")

    plt.tight_layout()
    plot2_path = os.path.join(RESULTS_DIR, "model_comparison.png")
    plt.savefig(plot2_path, dpi=200)
    plt.close()

    # -------------------------------------------------------------------------
    # Plot 3: Feature Importance for the Best Model
    # -------------------------------------------------------------------------
    best_importances = results[best_model_name].get("feature_importance", [])
    if best_importances:
        plt.figure(figsize=(9, 5))
        top_k = best_importances[:10]  # top 10 features
        feat_labels = [item["feature"] for item in reversed(top_k)]
        feat_scores = [item.get("importance", item.get("abs_importance", 0)) for item in reversed(top_k)]

        plt.barh(feat_labels, feat_scores, color="#0284c7")
        plt.title(f"Feature Importance ({best_model_name})", fontsize=12, fontweight="bold", pad=12)
        plt.xlabel("Relative Importance Weight", fontsize=10)
        plt.grid(True, axis="x", linestyle=":", alpha=0.6)
        plt.tight_layout()
        plot3_path = os.path.join(RESULTS_DIR, "feature_importance.png")
        plt.savefig(plot3_path, dpi=200)
        plt.close()

    print(f"[Plots] Generated evaluation plots in {RESULTS_DIR}")


def train_and_evaluate(test_size=0.20, random_state=42):
    """
    Main training and evaluation pipeline:
    1. Loads dataset
    2. Splits train/test (80/20) with random_state=42
    3. Fits ColumnTransformer within Pipeline
    4. Trains Linear Regression, Decision Tree, Random Forest
    5. Evaluates test set (MAE, RMSE, R²) and 5-fold CV
    6. Selects and saves best model pipeline to joblib
    7. Saves metadata and generates plots
    """
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(RESULTS_DIR, exist_ok=True)

    print("=" * 60)
    print("StudySense AI - Supervised Regression Model Training")
    print("=" * 60)

    # 1. Load data
    X, y, dataset_info = load_dataset()
    num_cols = dataset_info["numerical_features"]
    cat_cols = dataset_info["categorical_features"]

    print(f"Loaded {len(X)} samples across {len(X.columns)} raw features.")
    print(f"Target: {dataset_info['target_variable']} (Mean: {dataset_info['target_mean']}, Range: [{dataset_info['target_min']}, {dataset_info['target_max']}])")

    # 2. Train / Test Split (Strictly 80% train, 20% test, random_state=42)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    print(f"Training split: {len(X_train)} samples | Testing split: {len(X_test)} samples")

    # 3. Model definitions
    candidate_models = {
        "Linear Regression": LinearRegression(),
        "Decision Tree": DecisionTreeRegressor(random_state=random_state),
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=random_state, n_jobs=-1)
    }

    results = {}
    fitted_pipelines = {}
    predictions = {}

    for name, regressor in candidate_models.items():
        print(f"\nTraining [{name}]...")

        # Construct end-to-end Pipeline (Preprocessor -> Model)
        preprocessor = create_preprocessor(num_cols, cat_cols)
        pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("regressor", regressor)
        ])

        # Cross-Validation on Training set only (keeps test set pristine)
        cv_metrics = perform_cross_validation(pipeline, X_train, y_train, cv_folds=5, random_state=random_state)

        # Fit complete pipeline on entire training split
        pipeline.fit(X_train, y_train)
        fitted_pipelines[name] = pipeline

        # Predict on Test set
        y_pred = pipeline.predict(X_test)
        predictions[name] = y_pred

        # Calculate Test metrics
        test_metrics = calculate_metrics(y_test, y_pred)

        # Extract transformed feature names and importances
        feature_names = get_feature_names_out(pipeline.named_steps["preprocessor"], num_cols, cat_cols)
        feat_importances = extract_feature_importance(pipeline, feature_names)

        results[name] = {
            "test_metrics": test_metrics,
            "cv_metrics": cv_metrics,
            "feature_importance": feat_importances
        }

        print(f"  Test: MAE = {test_metrics['mae']:.2f} | RMSE = {test_metrics['rmse']:.2f} | R² = {test_metrics['r2']:.4f}")
        print(f"  5-Fold CV: Mean MAE = {cv_metrics['cv_mae_mean']:.2f} | Mean RMSE = {cv_metrics['cv_rmse_mean']:.2f} | Mean R² = {cv_metrics['cv_r2_mean']:.4f}")

    # 4. Display Comparison Table
    print("\n" + "=" * 60)
    print("MODEL COMPARISON TABLE (Real Calculated Metrics)")
    print("=" * 60)
    table_md = format_comparison_table(results)
    print(table_md)

    # 5. Model Selection (Highest R² and lowest RMSE on test set)
    best_model_name = max(results.keys(), key=lambda m: (results[m]["test_metrics"]["r2"], -results[m]["test_metrics"]["rmse"]))
    best_pipeline = fitted_pipelines[best_model_name]
    best_results = results[best_model_name]

    print("\n" + "=" * 60)
    print(f"SELECTED BEST MODEL: [{best_model_name}]")
    print(f"Reason: Achieved highest R² ({best_results['test_metrics']['r2']:.4f}) and lowest RMSE ({best_results['test_metrics']['rmse']:.2f}) on unseen test data.")
    print("=" * 60)

    # Top features
    print("\nMost Influential Features:")
    for feat in best_results["feature_importance"][:5]:
        print(f"  - {feat['feature']}: {feat.get('importance', feat.get('abs_importance', 0)):.4f}")

    # 6. Save Best Pipeline (Preprocessor + Regressor)
    best_model_path = os.path.join(MODELS_DIR, "best_model.joblib")
    joblib.dump(best_pipeline, best_model_path)
    print(f"\n[Model Save] Successfully saved complete pipeline to: {best_model_path}")

    # 7. Save Model Metadata
    metadata = {
        "modelName": best_model_name,
        "targetVariable": dataset_info["target_variable"],
        "trainedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "randomState": random_state,
        "dataset": {
            "name": "UCI Student Performance Data Set",
            "source": "https://archive.ics.uci.edu/dataset/320/student+performance",
            "totalSamples": dataset_info["total_records"],
            "trainSamples": len(X_train),
            "testSamples": len(X_test)
        },
        "features": {
            "rawNumerical": num_cols,
            "rawCategorical": cat_cols,
            "transformed": get_feature_names_out(best_pipeline.named_steps["preprocessor"], num_cols, cat_cols)
        },
        "metrics": {
            "testMae": best_results["test_metrics"]["mae"],
            "testRmse": best_results["test_metrics"]["rmse"],
            "testR2": best_results["test_metrics"]["r2"],
            "cvMaeMean": best_results["cv_metrics"]["cv_mae_mean"],
            "cvRmseMean": best_results["cv_metrics"]["cv_rmse_mean"],
            "cvR2Mean": best_results["cv_metrics"]["cv_r2_mean"]
        },
        "allModelsComparison": {
            m: {
                "testMae": results[m]["test_metrics"]["mae"],
                "testRmse": results[m]["test_metrics"]["rmse"],
                "testR2": results[m]["test_metrics"]["r2"],
                "cvMaeMean": results[m]["cv_metrics"]["cv_mae_mean"],
                "cvRmseMean": results[m]["cv_metrics"]["cv_rmse_mean"],
                "cvR2Mean": results[m]["cv_metrics"]["cv_r2_mean"]
            }
            for m in results
        },
        "topFeatures": best_results["feature_importance"][:8]
    }

    metadata_path = os.path.join(MODELS_DIR, "model_metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[Metadata] Successfully saved model metadata to: {metadata_path}")

    # Also save evaluation metrics in results/
    results_json_path = os.path.join(RESULTS_DIR, "evaluation_metrics.json")
    with open(results_json_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # 8. Generate Visualizations
    feature_names = get_feature_names_out(best_pipeline.named_steps["preprocessor"], num_cols, cat_cols)
    generate_evaluation_plots(results, best_model_name, y_test, predictions, feature_names)

    return metadata


if __name__ == "__main__":
    train_and_evaluate()

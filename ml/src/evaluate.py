"""
StudySense AI - Model Evaluation & Cross-Validation Metrics
Calculates true statistical metrics (MAE, RMSE, R2) and feature importances.
Strictly adheres to: ZERO hardcoded or fabricated numbers.
"""

import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_validate


def calculate_metrics(y_true, y_pred):
    """
    Compute regression metrics: MAE, RMSE, R2.
    
    Args:
        y_true (array-like): Ground truth target values
        y_pred (array-like): Predicted values
        
    Returns:
        dict: { mae, rmse, r2 }
    """
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)

    return {
        "mae": float(round(mae, 3)),
        "rmse": float(round(rmse, 3)),
        "r2": float(round(r2, 4))
    }


def perform_cross_validation(pipeline, X_train, y_train, cv_folds=5, random_state=42):
    """
    Perform K-Fold Cross Validation on the training set.
    Keeps the test set untouched to measure realistic generalization.
    
    Returns:
        dict: { cv_mae_mean, cv_mae_std, cv_rmse_mean, cv_rmse_std, cv_r2_mean, cv_r2_std }
    """
    kf = KFold(n_splits=cv_folds, shuffle=True, random_state=random_state)
    
    scoring = {
        "neg_mae": "neg_mean_absolute_error",
        "neg_rmse": "neg_root_mean_squared_error",
        "r2": "r2"
    }

    cv_results = cross_validate(pipeline, X_train, y_train, cv=kf, scoring=scoring, n_jobs=-1)

    cv_mae = -cv_results["test_neg_mae"]
    cv_rmse = -cv_results["test_neg_rmse"]
    cv_r2 = cv_results["test_r2"]

    return {
        "cv_folds": cv_folds,
        "cv_mae_mean": float(round(np.mean(cv_mae), 3)),
        "cv_mae_std": float(round(np.std(cv_mae), 3)),
        "cv_rmse_mean": float(round(np.mean(cv_rmse), 3)),
        "cv_rmse_std": float(round(np.std(cv_rmse), 3)),
        "cv_r2_mean": float(round(np.mean(cv_r2), 4)),
        "cv_r2_std": float(round(np.std(cv_r2), 4))
    }


def extract_feature_importance(pipeline, feature_names):
    """
    Extract feature importance scores or coefficients from the final estimator in a pipeline.
    
    Returns:
        list of dict: [ { feature, importance }, ... ] sorted descending
    """
    model = pipeline.named_steps.get("regressor") or pipeline.steps[-1][1]

    importances = []

    # Tree-based feature importances
    if hasattr(model, "feature_importances_"):
        raw_vals = model.feature_importances_
        for name, val in zip(feature_names, raw_vals):
            importances.append({
                "feature": name,
                "importance": float(round(val, 4))
            })
    # Linear Regression coefficients
    elif hasattr(model, "coef_"):
        raw_vals = model.coef_
        for name, val in zip(feature_names, raw_vals):
            importances.append({
                "feature": name,
                "importance": float(round(val, 4)),
                "abs_importance": float(round(abs(val), 4))
            })
        importances.sort(key=lambda x: x.get("abs_importance", 0), reverse=True)
        return importances

    importances.sort(key=lambda x: x["importance"], reverse=True)
    return importances


def format_comparison_table(results_dict):
    """
    Format model comparison results into a clean markdown table.
    """
    lines = [
        "| Model | Test MAE | Test RMSE | Test R² | CV Mean MAE | CV Mean RMSE | CV Mean R² |",
        "| :--- | :---: | :---: | :---: | :---: | :---: | :---: |"
    ]

    for model_name, res in results_dict.items():
        test_m = res["test_metrics"]
        cv_m = res["cv_metrics"]
        lines.append(
            f"| {model_name} | {test_m['mae']:.2f} | {test_m['rmse']:.2f} | {test_m['r2']:.3f} | "
            f"{cv_m['cv_mae_mean']:.2f} | {cv_m['cv_rmse_mean']:.2f} | {cv_m['cv_r2_mean']:.3f} |"
        )

    return "\n".join(lines)

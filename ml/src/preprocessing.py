"""
StudySense AI - Feature Preprocessing Pipeline
Builds reproducible scikit-learn ColumnTransformer pipelines for numerical scaling,
imputation, and categorical encoding without data leakage.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

try:
    from .data_loader import NUMERICAL_FEATURES, CATEGORICAL_FEATURES
except ImportError:
    from data_loader import NUMERICAL_FEATURES, CATEGORICAL_FEATURES


def create_preprocessor(numerical_features=None, categorical_features=None):
    """
    Construct a scikit-learn ColumnTransformer for robust preprocessing.
    
    Processing Steps:
    1. Numerical Features:
       - SimpleImputer(strategy="median"): Imputes missing values using training median
       - StandardScaler(): Normalizes features to zero mean and unit variance
    2. Categorical Features:
       - SimpleImputer(strategy="most_frequent"): Imputes missing categories
       - OneHotEncoder(handle_unknown="ignore", sparse_output=False): Encodes discrete classes
    
    Guarantees:
    - Zero data leakage: Transformer is fitted exclusively on training splits.
    - Deterministic and exportable via joblib.
    """
    num_cols = numerical_features if numerical_features is not None else NUMERICAL_FEATURES
    cat_cols = categorical_features if categorical_features is not None else CATEGORICAL_FEATURES

    # Numerical Transformer Pipeline
    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    # Categorical Transformer Pipeline
    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    # Combined ColumnTransformer
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, num_cols),
            ("cat", cat_pipeline, cat_cols)
        ],
        remainder="drop"
    )

    return preprocessor


def get_feature_names_out(fitted_preprocessor, numerical_features=None, categorical_features=None):
    """
    Extract readable transformed feature names from a fitted ColumnTransformer.
    """
    feature_names = []
    
    # 1. Numerical feature names
    num_cols = numerical_features if numerical_features is not None else NUMERICAL_FEATURES
    feature_names.extend(num_cols)

    # 2. Categorical one-hot encoded names
    cat_cols = categorical_features if categorical_features is not None else CATEGORICAL_FEATURES
    try:
        cat_transformer = fitted_preprocessor.named_transformers_.get("cat")
        if cat_transformer and hasattr(cat_transformer.named_steps["onehot"], "get_feature_names_out"):
            cat_names = cat_transformer.named_steps["onehot"].get_feature_names_out(cat_cols)
            feature_names.extend(list(cat_names))
        else:
            feature_names.extend(cat_cols)
    except Exception:
        feature_names.extend(cat_cols)

    return feature_names


if __name__ == "__main__":
    import pandas as pd
    from .data_loader import load_dataset
    
    print("=== Testing Preprocessing Pipeline ===")
    X, y, info = load_dataset()
    preprocessor = create_preprocessor(info["numerical_features"], info["categorical_features"])
    X_transformed = preprocessor.fit_transform(X)
    
    names = get_feature_names_out(preprocessor, info["numerical_features"], info["categorical_features"])
    print(f"Original shape: {X.shape}")
    print(f"Transformed shape: {X_transformed.shape}")
    print(f"Transformed feature count: {len(names)}")
    print("Transformed feature names:", names)

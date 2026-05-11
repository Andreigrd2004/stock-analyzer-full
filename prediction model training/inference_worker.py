import argparse
import sys

import numpy as np
from tensorflow.keras.models import load_model


def main():
    parser = argparse.ArgumentParser(description="Run model inference in an isolated process.")
    parser.add_argument("--model", required=True)
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    try:
        x_test = np.load(args.input)
        model = load_model(args.model, compile=False)
        y_pred = model.predict(x_test, verbose=0)
        np.save(args.output, y_pred)
        return 0
    except Exception as exc:
        print(f"Inference worker error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())


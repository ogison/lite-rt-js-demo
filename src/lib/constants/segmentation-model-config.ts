export const SEGMENTATION_MODEL_URL = '/models/segmentation.tflite';

// Confirmed via model.getInputDetails(): input_1, float32, [1, 144, 256, 3]
export const SEGMENTATION_INPUT_WIDTH = 256;
export const SEGMENTATION_INPUT_HEIGHT = 144;
export const SEGMENTATION_INPUT_CHANNELS = 3;

/** Minimum interval between two inference calls while streaming from the camera. */
export const SEGMENTATION_INTERVAL_MS = 150;

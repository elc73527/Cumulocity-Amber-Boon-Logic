package com.softwareag.amber.model;

import lombok.Data;

@Data
public class AmberSensorConfiguration {

    private int featureCount;

    private int streamingWindowSize;

    private int samplesToBuffer;

    private int learningRateNumerator;

    private int learningRateDenominator;

    private int learningMaxClusters;

    private int learningMaxSamples;

    private int anomalyHistoryWindow;

    private int percentVariation;

    private Feature[] features;

    @Data
    public static class Feature {
        private String label;

        private int maxVal;

        private int minVal;

        private String submitRule;
    }
}

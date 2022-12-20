package com.softwareag.amber.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AmberSensorConfiguration {

    private int featureCount;

    private int streamingWindowSize;

    private long samplesToBuffer;

    private long learningRateNumerator;

    private long learningRateDenominator;

    private int learningMaxClusters;

    private long learningMaxSamples;

    private int anomalyHistoryWindow;

    private double percentVariation;

    private Feature[] features;

    @Data
    public static class Feature {
        private String label;

        private double maxVal;

        private double minVal;

        private String submitRule;
    }
}

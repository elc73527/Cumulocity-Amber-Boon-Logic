package com.softwareag.amber.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
public class ServiceConfiguration {

    private @NotNull String username;

    private @NotNull String password;

    private @NotNull String url;
}

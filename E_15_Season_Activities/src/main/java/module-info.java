module at.htlvillach.e_15_season_activities {
    requires javafx.controls;
    requires javafx.fxml;

    requires org.kordamp.bootstrapfx.core;
    requires java.sql;
    requires javafx.graphics;
    requires com.fasterxml.jackson.databind;

    opens at.htlvillach.e_15_season_activities to javafx.fxml;
    exports at.htlvillach.e_15_season_activities;
    exports at.htlvillach.e_15_season_activities.service;
    exports at.htlvillach.e_15_season_activities.model;
    exports at.htlvillach.e_15_season_activities.repository;
    exports at.htlvillach.e_15_season_activities.viewmodel;

}
package at.htlvillach.e_15_season_activities.model;

import java.io.Serializable;

public class Activity implements Serializable {
    private int id;
    private Season season;
    private String identifier;

    public Activity( Season season, String identifier) {
        this.season = season;
        this.identifier = identifier;
    }

    public Activity() {
    }

    public Activity(int id, Season season, String identifier) {
        this.id = id;
        this.season = season;
        this.identifier = identifier;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Season getSeason() {
        return season;
    }

    public void setSeason(Season season) {
        this.season = season;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    @Override
    public String toString() {
        return identifier;
    }
}

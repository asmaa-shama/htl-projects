package at.htlvillach.e_15_season_activities.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class Season implements Serializable {
    private String identifier;
    private int id;

    public Season() {
    }

    public Season(String identifier, int id) {
        this.identifier = identifier;
        this.id = id;
    }


    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    @Override
    public String toString() {
        return identifier;
    }
}

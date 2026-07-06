package at.htlvillach.e_15_season_activities.viewmodel;

import at.htlvillach.e_15_season_activities.model.Activity;
import at.htlvillach.e_15_season_activities.model.Person;
import at.htlvillach.e_15_season_activities.model.Season;
import javafx.beans.property.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ActivityViewmodel {

    private IntegerProperty id = new SimpleIntegerProperty();
    private ObjectProperty<Season> season = new SimpleObjectProperty<>();
    private StringProperty identifier = new SimpleStringProperty();

    public ActivityViewmodel(Activity activity) {
        id.set(activity.getId());
        season.set(activity.getSeason());
        identifier.set(activity.getIdentifier());

    }

    public static List<ActivityViewmodel> mapList(List<Activity> activities) {
        if (activities != null)
            return activities.stream().map(a -> new ActivityViewmodel(a)).collect(Collectors.toList());
        else return new ArrayList<ActivityViewmodel>();
    }

    public int getId() {
        return id.get();
    }

    public IntegerProperty idProperty() {
        return id;
    }

    public void setId(int id) {
        this.id.set(id);
    }

    public Season getSeason() {
        return season.get();
    }

    public ObjectProperty<Season> seasonProperty() {
        return season;
    }

    public void setSeason(Season season) {
        this.season.set(season);
    }

    public String getIdentifier() {
        return identifier.get();
    }

    public StringProperty identifierProperty() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier.set(identifier);
    }

    @Override
    public String
    toString() {
        return identifier.get() + " - " + season.get();
    }

    public Activity toActivity() {
        return new Activity(this.getId(), this.getSeason(), this.getIdentifier());
    }
}

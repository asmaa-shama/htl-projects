package at.htlvillach.e_15_season_activities.repository;

import at.htlvillach.e_15_season_activities.model.Activity;
import at.htlvillach.e_15_season_activities.model.Person;
import at.htlvillach.e_15_season_activities.model.Season;

import java.util.List;
import java.util.List;

public interface Repository {
    List<Person> findAll();
    Person insert(Person a);
    void update(Person a);
    void delete(int id);

    List<Activity> getActivities();

    List<Season> getSeason();

    Activity insertActivity(Activity activity);

    void deleteActivity(int id);

    void updateActivity(Activity activity);
}

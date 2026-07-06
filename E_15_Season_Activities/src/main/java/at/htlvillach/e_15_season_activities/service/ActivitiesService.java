package at.htlvillach.e_15_season_activities.service;

import at.htlvillach.e_15_season_activities.model.Activity;
import at.htlvillach.e_15_season_activities.model.Person;
import at.htlvillach.e_15_season_activities.model.Season;
import at.htlvillach.e_15_season_activities.repository.DatabaseRepository;
import at.htlvillach.e_15_season_activities.repository.Repository;

import java.util.List;

public class ActivitiesService {
    Repository repository;

    public ActivitiesService(Repository repository) {
        this.repository = repository;
    }

    public List<Person> findAll(){
        return  repository.findAll();
    }

    public List<Activity> getActivities(){
        return repository.getActivities();
    }

    public void update(Person person) {
        repository.update(person);
    }

    public void delete(int id){
        repository.delete(id);
    }

    public Person insert(Person person){
        return repository.insert(person);
    }

    public List<Season> getSeasons(){
        return repository.getSeason();
    }

    public Activity insertActivity(Activity activity){
        return repository.insertActivity(activity);
    }

    public void deleteActivity(int id){
        repository.deleteActivity(id);
    }

    public void updateActivity(Activity activity) {
        repository.updateActivity(activity);
    }
}

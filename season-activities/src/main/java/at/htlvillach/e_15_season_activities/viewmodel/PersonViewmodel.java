package at.htlvillach.e_15_season_activities.viewmodel;

import at.htlvillach.e_15_season_activities.model.Activity;
import at.htlvillach.e_15_season_activities.model.Person;
import javafx.beans.property.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class PersonViewmodel {
/*
    private String firstname;
    private String lastname;
    private int id;
    private Activity activity;
 */

    private StringProperty firstnameViewmodel = new SimpleStringProperty();
    private StringProperty lastnameViewmodel = new SimpleStringProperty();
    private IntegerProperty idViewmodel = new SimpleIntegerProperty();
    private ObjectProperty<Activity> activityViewmodel = new SimpleObjectProperty<>();

    public PersonViewmodel(Person person ) {
        firstnameViewmodel.set(person.getFirstname());
        lastnameViewmodel.set(person.getLastname());
        idViewmodel.set(person.getId());
        activityViewmodel.set(person.getActivity());
    }

    public static List<PersonViewmodel> mapList(List<Person> persons) {
        if(persons != null) {
            return persons.stream().map(person -> new PersonViewmodel(person)).collect(Collectors.toList());
        }
        return new ArrayList<PersonViewmodel>();
    }

    public String getFirstnameViewmodel() {
        return firstnameViewmodel.get();
    }

    public StringProperty firstnameViewmodelProperty() {
        return firstnameViewmodel;
    }

    public void setFirstnameViewmodel(String firstnameViewmodel) {
        this.firstnameViewmodel.set(firstnameViewmodel);
    }

    public String getLastnameViewmodel() {
        return lastnameViewmodel.get();
    }

    public StringProperty lastnameViewmodelProperty() {
        return lastnameViewmodel;
    }

    public void setLastnameViewmodel(String lastnameViewmodel) {
        this.lastnameViewmodel.set(lastnameViewmodel);
    }

    public int getIdViewmodel() {
        return idViewmodel.get();
    }

    public IntegerProperty idViewmodelProperty() {
        return idViewmodel;
    }

    public void setIdViewmodel(int idViewmodel) {
        this.idViewmodel.set(idViewmodel);
    }

    public Activity getActivityViewmodel() {
        return activityViewmodel.get();
    }

    public ObjectProperty<Activity> activityViewmodelProperty() {
        return activityViewmodel;
    }

    public void setActivityViewmodel(Activity activityViewmodel) {
        this.activityViewmodel.set(activityViewmodel);
    }

    @Override
    public String toString() {
        return lastnameViewmodel.get().toUpperCase() + " " + firstnameViewmodel.get().toUpperCase() + " - " + activityViewmodel.get();
    }

    public Person toPerson(){
        return new Person(firstnameViewmodel.get(), lastnameViewmodel.get(), idViewmodel.get(), activityViewmodel.get());
    }
}

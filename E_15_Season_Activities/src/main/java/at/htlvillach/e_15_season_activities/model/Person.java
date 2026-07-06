package at.htlvillach.e_15_season_activities.model;

import java.io.Serializable;

public class Person implements Serializable {

    private String firstname;
    private String lastname;
    private int id;
    private Activity activity;

    public Person() {
    }

    public Person(String firstname, String lastname, int id, Activity activity) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.id = id;
        this.activity = activity;
    }
    public Person(String firstname, String lastname, Activity activity) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.activity = activity;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Activity getActivity() {
        return activity;
    }

    public void setActivity(Activity activity) {
        this.activity = activity;
    }

    @Override
    public String toString() {
        return firstname + " " + lastname + " - " + activity;
    }
}

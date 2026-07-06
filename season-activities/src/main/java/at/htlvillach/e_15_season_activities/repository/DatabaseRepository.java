package at.htlvillach.e_15_season_activities.repository;

import at.htlvillach.e_15_season_activities.model.Activity;
import at.htlvillach.e_15_season_activities.model.Person;
import at.htlvillach.e_15_season_activities.model.Season;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DatabaseRepository implements Repository{
    private Map<Integer, Season> seasons = new HashMap<>();
    private Map<Integer, Activity> activities = new HashMap<>();

    private String driver;
    private String url;
    private String username;
    private String password;

    private static final String SELECT_ALL_ACTIVITY = "SELECT id, idSeason, identifier FROM Activity";
    private static final String SELECT_ALL_PERSONS  = "SELECT firstname, lastname, id, idActivity FROM Person";
    private static final String SELECT_ALL_SEASONS = "SELECT identifier, id FROM Season";
    private static final String UPDATE_Person = "UPDATE Person SET firstname = ? , " +
            "lastname = ?, "+
            "idActivity = ? "+
            "WHERE id = ?";
    private static final String INSERT_PERSON = "INSERT INTO Person (firstname, lastname, idActivity) VALUES (?, ?, ?)";
    private static final String DELETE_PERSON = "DELETE FROM Person WHERE id = ?";
    private static final String INSERT_ACTIVITY = "INSERT INTO Activity (identifier, idSeason) VALUES (?, ?)";;
    private static final String DELETE_ACTIVITY = "DELETE FROM ACTIVITY WHERE id = ?";
    private static final String UPDATE_ACTIVITY = "UPDATE Activity SET identifier = ? , " +
            "idSeason = ? "+
            "WHERE id = ?";

    public DatabaseRepository() {
        this.driver = "oracle.jdbc.OracleDriver";
        this.url = "url";
        this.username = "username";
        this.password = "password";

        getActivities();
        getSeason();
    }

    private Connection getConnection(){
        Connection con = null;
        try {
            Class.forName(driver);
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
        try {
            con = DriverManager.getConnection(url,username,password);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return con;
    }

    public List<Season> getSeason(){
        List<Season> seasonArrayList = new ArrayList<>();
        Season season;
        Statement stmt;
        ResultSet resultSet;

        try (Connection con = this.getConnection()) {
            stmt = con.createStatement();
            resultSet = stmt.executeQuery(SELECT_ALL_SEASONS);
            while(resultSet.next()){
                season = new Season(
                        resultSet.getString(1),
                        resultSet.getInt(2)
                );
                seasons.put(season.getId(),season);
                seasonArrayList.add(season);
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return seasonArrayList;
    }

    public List<Activity> getActivities(){
        List<Activity> activityList = new ArrayList<>();
        Activity activity;
        Statement stmt;
        ResultSet resultSet;

        try (Connection con = this.getConnection()) {
            stmt = con.createStatement();
            resultSet = stmt.executeQuery(SELECT_ALL_ACTIVITY);
            while(resultSet.next()){
            /*
                    this.id = id;
                    this.season = season;
                    this.identifier = identifier;
             */
                activity = new Activity(
                        resultSet.getInt(1),
                        seasons.get(resultSet.getInt(2)),
                        resultSet.getString(3)
                );
                activities.put(activity.getId(),activity);
                activityList.add(activity);
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return activityList;
    }

    public List<Person> findAll() {
        List<Person> personList = new ArrayList<>();
        Person person;
        Statement stmt;
        ResultSet resultSet;

        try (Connection con = this.getConnection()) {
            stmt = con.createStatement();
            resultSet = stmt.executeQuery(SELECT_ALL_PERSONS);
            while(resultSet.next()){

                person = new Person(
                        resultSet.getString(1),
                        resultSet.getString(2),
                        resultSet.getInt(3),
                        activities.get(resultSet.getInt(4))
                );
                personList.add(person);
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return personList;
    }

    public void update(Person person) {
        PreparedStatement preparedStatement;

        try (Connection con = getConnection()){
            preparedStatement = con.prepareStatement(UPDATE_Person);
            preparedStatement.setString(1,person.getFirstname());
            preparedStatement.setString(2, person.getLastname());
            preparedStatement.setInt(3, person.getActivity().getId());
            preparedStatement.setInt(4, person.getId());
            preparedStatement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public void delete(int id) {
        PreparedStatement preparedStatement;

        try (Connection con = getConnection()) {
            preparedStatement = con.prepareStatement(DELETE_PERSON);
            preparedStatement.setInt(1, id);
            preparedStatement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public Person insert(Person p) {
        ResultSet resultSet;
        PreparedStatement preparedStatement;

        try (Connection con = this.getConnection()) {
            preparedStatement = con.prepareStatement(INSERT_PERSON, new String[]{"id"});
            preparedStatement.setString(1, p.getFirstname());
            preparedStatement.setString(2, p.getLastname());
            preparedStatement.setInt(3, p.getActivity().getId());

            preparedStatement.execute();

            resultSet = preparedStatement.getGeneratedKeys();

            if (resultSet.next()) {
                p.setId(resultSet.getInt(1));
                return p;
            }

            return null;

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public Activity insertActivity(Activity a) {
        ResultSet resultSet;
        PreparedStatement preparedStatement;

        try (Connection con = this.getConnection()) {
            preparedStatement = con.prepareStatement(INSERT_ACTIVITY, new String[]{"id"});
            preparedStatement.setString(1, a.getIdentifier());
            preparedStatement.setInt(2, a.getSeason().getId());
            preparedStatement.execute();

            resultSet = preparedStatement.getGeneratedKeys();

            if (resultSet.next()) {
                a.setId(resultSet.getInt(1));
                return a;
            }

            return null;

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public void deleteActivity(int id) {
        PreparedStatement preparedStatement;

        try (Connection con = getConnection()) {
            preparedStatement = con.prepareStatement(DELETE_ACTIVITY);
            preparedStatement.setInt(1, id);
            preparedStatement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public void updateActivity(Activity activity) {
        PreparedStatement preparedStatement;

        try (Connection con = getConnection()){
            preparedStatement = con.prepareStatement(UPDATE_ACTIVITY);
            preparedStatement.setString(1,activity.getIdentifier());
            preparedStatement.setInt(2, activity.getSeason().getId());
            preparedStatement.setInt(3, activity.getId());
            preparedStatement.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }


}

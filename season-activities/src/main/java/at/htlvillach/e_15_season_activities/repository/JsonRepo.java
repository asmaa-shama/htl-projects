package at.htlvillach.e_15_season_activities.repository;

import at.htlvillach.e_15_season_activities.model.Activity;
import at.htlvillach.e_15_season_activities.model.Person;
import at.htlvillach.e_15_season_activities.model.Season;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class JsonRepo implements Repository{
    private static final String SERIALIZEDPERSONSJSON = "persons.json";
    private ObjectMapper mapper;
    private int nextId = 0;
    private static final String SERIALIZEDACTIVITYJSON = "activities.json";
    private static final String SERIALIZEDSEASONJSON = "seasons.json";
    private List<Person> personList = new ArrayList<>();
    private List<Activity> activityList = new ArrayList<>();
    private int nextIdActivity = 0;
    private List<Season> seasonList = new ArrayList<>(List.of(new Season("Winter", 1), new Season("Sommer", 2)));



    public JsonRepo(){
        mapper = new ObjectMapper();
    }


    @Override
    public List<Person> findAll() {
        StringBuilder sb = new StringBuilder();
        String line;
        try ( BufferedReader reader = new BufferedReader(new FileReader(SERIALIZEDPERSONSJSON))){
            while((line = reader.readLine() )!= null){
                sb.append(line);
            }
            personList = mapper.readValue(sb.toString(), new TypeReference<>() {
            });
        } catch(EOFException ex){
            System.out.println("Datei (noch) nicht befüllt!");
        }catch (IOException e) {
            throw new RuntimeException(e);
        }
        return personList;

    }

    @Override
    public Person insert(Person person) {
        try(BufferedWriter writer = new BufferedWriter(new FileWriter(SERIALIZEDPERSONSJSON))){
            person.setId(nextId++);
            personList.add(person);
            writer.write(mapper.writeValueAsString(personList));
        } catch(EOFException ex){
            System.out.println("Datei (noch) nicht befüllt!");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return person;
    }

    @Override
    public void update(Person person) {
        try(BufferedWriter writer = new BufferedWriter(new FileWriter(SERIALIZEDPERSONSJSON))){
            Person per = findPerson(person.getId());
            if (per != null) {
                per.setActivity(person.getActivity());
                per.setFirstname(person.getFirstname());
                per.setLastname(person.getLastname());
                writer.write(mapper.writeValueAsString(personList));
            }
        } catch(EOFException ex){
            System.out.println("Datei (noch) nicht befüllt!");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private Person findPerson(int id) {
        for (Person p : personList) {
            if (p.getId() == id) {
                return p;
            }
        }
        return null;
    }

    @Override
    public void delete(int id) {
        try(BufferedWriter writer = new BufferedWriter(new FileWriter(SERIALIZEDPERSONSJSON))){
            personList = personList.stream().filter(person -> person.getId() != id).collect(Collectors.toList());
            writer.write(mapper.writeValueAsString(personList));
        } catch(EOFException ex){
            System.out.println("Datei (noch) nicht befüllt!");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<Activity> getActivities() {
        StringBuilder sb = new StringBuilder();
        String line;
        try ( BufferedReader reader = new BufferedReader(new FileReader(SERIALIZEDACTIVITYJSON))){
            while((line = reader.readLine() )!= null){
                sb.append(line);
            }
            activityList = mapper.readValue(sb.toString(), new TypeReference<>() {
            });
        } catch(EOFException ex){
            System.out.println("Datei (noch) nicht befüllt!");
        }catch (IOException e) {
            throw new RuntimeException(e);
        }
        return activityList;
    }

    @Override
    public List<Season> getSeason() {
        StringBuilder sb = new StringBuilder();
        String line;
        try ( BufferedReader reader = new BufferedReader(new FileReader(SERIALIZEDSEASONJSON))){
            while((line = reader.readLine() )!= null){
                sb.append(line);
            }
            if (!sb.toString().isEmpty()){
                seasonList = mapper.readValue(sb.toString(), new TypeReference<>() {
            });}
            else {
                seasonList = new ArrayList<>(List.of(new Season("Winter", 1), new Season("Sommer", 2)));

            }
        } catch(EOFException ex){
            System.out.println("Datei (noch) nicht befüllt!");
        }catch (IOException e) {
            throw new RuntimeException(e);
        }
        return seasonList;
    }

    @Override
    public Activity insertActivity(Activity activity) {
        try(BufferedWriter writer = new BufferedWriter(new FileWriter(SERIALIZEDACTIVITYJSON))){
            activity.setId(nextIdActivity++);
            activityList.add(activity);
            writer.write(mapper.writeValueAsString(activityList));
        } catch(EOFException ex){
            System.out.println("Datei (noch) nicht befüllt!");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return activity;
    }

    @Override
    public void deleteActivity(int id) {
        try(BufferedWriter writer = new BufferedWriter(new FileWriter(SERIALIZEDACTIVITYJSON))){
            activityList = activityList.stream().filter(activity -> activity.getId() != id).collect(Collectors.toList());
            writer.write(mapper.writeValueAsString(activityList));
        } catch(EOFException ex){
            System.out.println("Datei (noch) nicht befüllt!");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void updateActivity(Activity activity) {
        try(BufferedWriter writer = new BufferedWriter(new FileWriter(SERIALIZEDACTIVITYJSON))){
            Activity ac = findActivity(activity.getId());
            if (ac != null) {
                ac.setSeason(activity.getSeason());
                ac.setIdentifier(activity.getIdentifier());
                writer.write(mapper.writeValueAsString(activityList));
            }
        } catch(EOFException ex){
            System.out.println("Datei (noch) nicht befüllt!");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private Activity findActivity(int id) {
        for (Activity p : activityList) {
            if (p.getId() == id) {
                return p;
            }
        }
        return null;
    }
}

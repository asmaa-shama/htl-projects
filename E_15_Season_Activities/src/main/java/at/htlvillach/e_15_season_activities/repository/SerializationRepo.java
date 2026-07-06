package at.htlvillach.e_15_season_activities.repository;

import at.htlvillach.e_15_season_activities.model.Activity;
import at.htlvillach.e_15_season_activities.model.Person;
import at.htlvillach.e_15_season_activities.model.Season;

import java.io.*;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class SerializationRepo implements Repository{
    private static final String SERIALIZEDPERSONSBINARY = "persons.dat";
    private static final String SERIALIZEDACTIVITYBINARY = "activities.dat";
    private static final String SERIALIZEDSEASONBINARY = "seasons.dat";
    private List<Person> personList = new ArrayList<>();
    private List<Activity> activityList = new ArrayList<>();
    private int nextId = 0;
    private int nextIdActivity = 0;
    private List<Season> seasonList = new ArrayList<>(List.of(new Season("Winter", 1), new Season("Sommer", 2)));

    public Person insert(Person p) {
        try (ObjectOutputStream stream = new ObjectOutputStream(new FileOutputStream(SERIALIZEDPERSONSBINARY))) {
            p.setId(nextId);
            personList.add(p);
            stream.writeObject(personList);
            nextId++;
            return p;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public List<Person> findAll() {
        try (ObjectInputStream stream = new ObjectInputStream(new FileInputStream(SERIALIZEDPERSONSBINARY))) {
            personList = (ArrayList<Person>) stream.readObject();

        }catch(EOFException ex){
            System.out.println("Datei (noch) nicht befüllt!");
        } catch (IOException | ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
        return personList;
    }

    public void delete(int id) {
        try (ObjectOutputStream stream = new ObjectOutputStream(new FileOutputStream(SERIALIZEDPERSONSBINARY))) {
            personList = personList.stream().filter(person -> person.getId() != id).collect(Collectors.toList());
            stream.writeObject(personList);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void update(Person p) {
        try (ObjectOutputStream stream = new ObjectOutputStream(new FileOutputStream(SERIALIZEDPERSONSBINARY))) {
            Person per = findPerson(p.getId());
            if (per != null) {
                per.setActivity(p.getActivity());
                per.setFirstname(p.getFirstname());
                per.setLastname(p.getLastname());
                stream.writeObject(personList);
            }
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

    public List<Activity> getActivities(){
        try (ObjectInputStream stream = new ObjectInputStream(new FileInputStream(SERIALIZEDACTIVITYBINARY))) {
            activityList = (ArrayList<Activity>) stream.readObject();
        }catch(EOFException ex){
            System.out.println("Datei (noch) nicht befüllt!");
        }  catch (IOException | ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
        return activityList;
    }

    public Activity insertActivity(Activity a) {
        try (ObjectOutputStream stream = new ObjectOutputStream(new FileOutputStream(SERIALIZEDACTIVITYBINARY))) {
            a.setId(nextIdActivity);
            activityList.add(a);
            stream.writeObject(activityList);
            nextIdActivity++;
            return a;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void deleteActivity(int id) {
        try (ObjectOutputStream stream = new ObjectOutputStream(new FileOutputStream(SERIALIZEDACTIVITYBINARY))) {
            activityList = activityList.stream().filter(activity -> activity.getId() != id).collect(Collectors.toList());
            stream.writeObject(activityList);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public void updateActivity(Activity a) {
        try (ObjectOutputStream stream = new ObjectOutputStream(new FileOutputStream(SERIALIZEDACTIVITYBINARY))) {
            Activity activity = findActivity(a.getId());
            if (activity != null) {
                activity.setIdentifier(a.getIdentifier());
                activity.setSeason(a.getSeason());
                stream.writeObject(activityList);
            }
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

    public List<Season> getSeason(){
        try (ObjectInputStream stream = new ObjectInputStream(new FileInputStream(SERIALIZEDSEASONBINARY))) {
            seasonList = (ArrayList<Season>) stream.readObject();
        }catch(EOFException ex){
            System.out.println("Datei (noch) nicht befüllt!");
        }  catch (IOException | ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
        return seasonList;
    }
}

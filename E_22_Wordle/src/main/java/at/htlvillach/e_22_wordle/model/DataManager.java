package at.htlvillach.e_22_wordle.model;
import java.io.*;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

public class DataManager {
    private static DataManager instance = new DataManager();
    private static final String APP_NAME = "wordle";

    public static Path getAppDataDirectory(){
        String os = System.getProperty("os.name").toLowerCase();
        String userHome = System.getProperty("user.home");
        String appData = System.getenv("APPDATA");
        return Paths.get(appData, APP_NAME);
    }

    public DataManager() {
    }
    public static DataManager getInstance(){
        return instance;
    }
    public ArrayList<String> getWords(){
        ArrayList<String> words = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(getClass().getResourceAsStream("/words.csv")))){
            String line = reader.readLine();
            if (line != null){
                Collections.addAll(words, line.split(";"));
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return words;
    }

    public void writeWords(ArrayList<String> words) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(getClass().getResource("/words.csv").getPath()))) {
            writer.write(String.join(";", words));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public ArrayList<Player> getLeaderboard() {
        ArrayList<Player> players = new ArrayList<>();
        Path dataFile = null;
        try {
            dataFile = getDataFile("leaderboard.csv");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        System.out.println("Daten werden gespeichert unter:");
        System.out.println(dataFile.toAbsolutePath());

        if (!Files.exists(dataFile)) {
            try {
                Files.writeString(dataFile, "{}");
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
            try (BufferedReader reader = new BufferedReader(new FileReader(dataFile.toFile()))) {
                String line;
                Player p;
                while ((line = reader.readLine()) != null) {
                    String[] data = line.split(";");
                    p = new Player(data[0]);
                    p.setGamesPlayed(Integer.parseInt(data[1]));
                    p.setPhoto(data[2]);
                    p.setHighScore(Integer.parseInt(data[3]));
                    p.setTotalPoints(Integer.parseInt(data[4]));
                    players.add(p);
                }
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        return players;
    }

    public static Path getDataFile(String fileName) throws IOException {
        Path appDir = getAppDataDirectory();
        Files.createDirectories(appDir);
        return appDir.resolve(fileName);
    }

    public void writeLeaderboard(ArrayList<Player> players) {
        Path dataFile = null;
        try {
            dataFile = getDataFile("leaderboard.csv");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        System.out.println("Daten werden gespeichert unter:");
        System.out.println(dataFile.toAbsolutePath());

        if (!Files.exists(dataFile)) {
            try {
                Files.writeString(dataFile, "{}");
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(dataFile.toFile()))) {
            for (Player p : players) {
                writer.write(p.getName() + ";" +
                        p.getGamesPlayed() + ";" +
                        p.getPhoto() + ";" +
                        p.getHighScore() + ";" +
                        p.getTotalPoints() + "\n"
                );
            }
        } catch (IOException e) {
            throw new RuntimeException("Fehler beim Schreiben des Leaderboards: " + e.getMessage(), e);
        }
    }

    public Player getPlayer(String name){
        List<Player> players = getLeaderboard();
        for (Player p: players){
            if (p.getName().equals(name)){
                return p;
            }
        }
        return null;
    }
}

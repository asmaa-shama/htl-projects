package at.htlvillach.e_22_wordle.model;

import java.io.*;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class GameSession implements Serializable {
    @Serial
    private static final long serialVersionUID = 1;
    private transient Player player;
    private List<WordleGame> games = new ArrayList();

    public GameSession(Player player) {
        this.player = player;
    }

    public WordleGame startNewGame(){
       List<String> words =  DataManager.getInstance().getWords();
       words.removeAll(games.stream().map(g->g.getWordToGuess()).collect(Collectors.toList()));
       int size = words.size();
       int randomIndex = (int) (Math.random()*size);
       WordleGame wordle =  new WordleGame(words.get(randomIndex));
       games.add(wordle);
       return wordle;
    }

    public void save() {
        try {
            // Hol den sicheren AppData-Pfad und erstelle dort einen Unterordner "game-sessions"
            Path folderPath = DataManager.getAppDataDirectory().resolve("game-sessions");
            File folder = folderPath.toFile();

            if (!folder.exists()) {
                folder.mkdirs();
            }

            File file = new File(folder, player.getName() + ".bin");

            try (ObjectOutputStream stream = new ObjectOutputStream(new FileOutputStream(file))) {
                stream.writeObject(this);
                System.out.println("Session erfolgreich gespeichert unter: " + file.getAbsolutePath());
            }
        } catch (IOException e) {
            throw new RuntimeException("Fehler beim Speichern der Session: " + e.getMessage(), e);
        }
    }

    public void load() {
        Path folderPath = DataManager.getAppDataDirectory().resolve("game-sessions");
        File file = new File(folderPath.toFile(), player.getName() + ".bin");

        if (!file.exists()) {
            System.out.println("Keine alte Spielsession gefunden.");
            return;
        }

        try (ObjectInputStream stream = new ObjectInputStream(new FileInputStream(file))) {
            GameSession gameSession = (GameSession) stream.readObject();
            this.games = gameSession.games;
        } catch (IOException | ClassNotFoundException e) {
            throw new RuntimeException("Fehler beim Laden der Session: " + e.getMessage(), e);
        }
    }

    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public List<Player> getLeaderboard(){
        return DataManager.getInstance().getLeaderboard();
    }

    public void saveUser(Player p) {
        ArrayList<Player> newPlayers = DataManager.getInstance().getLeaderboard();
        newPlayers.removeIf(player -> player.getName().equals(p.getName()));
        newPlayers.add(p);
        DataManager.getInstance().writeLeaderboard(newPlayers);
    }

    private Player leaderboardContains(ArrayList<Player> newPlayers, Player p) {
        for (Player player : newPlayers){
            if (player.getName().equals(p.getName())){
                return player;
            }
        }
        return null;
    }
}

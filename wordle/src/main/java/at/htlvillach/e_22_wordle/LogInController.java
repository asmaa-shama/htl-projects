package at.htlvillach.e_22_wordle;

import at.htlvillach.e_22_wordle.model.DataManager;
import at.htlvillach.e_22_wordle.model.GameSession;
import at.htlvillach.e_22_wordle.model.Player;
import javafx.collections.FXCollections;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.stage.Stage;

import java.io.IOException;
import java.net.URL;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.ResourceBundle;

public class LogInController implements Initializable {

    public ListView<Player> lvLeaderBoard;
    @FXML
    private Button btnPlay;

    @FXML
    private TextField tfUsername;

    @FXML
    void onBtnPlayClicked(ActionEvent event) {
        String name = tfUsername.getText();
        Optional<Player> player = DataManager.getInstance().getLeaderboard().stream().filter(p -> p.getName().equals(name)).findFirst();
        if (player.isPresent()) {
            GameSession gameSession = new GameSession(player.get());
            gameSession.load();
            openGame(gameSession);
        } else {
            if (!name.isBlank()) {
                Alert alert = new Alert(Alert.AlertType.INFORMATION, "This user doesn't exist. Do you wan to create a new account?", ButtonType.CANCEL, ButtonType.YES);
                Optional<ButtonType> buttonType = alert.showAndWait();
                if (buttonType.isPresent()) {
                    if (buttonType.get().equals(ButtonType.YES)) {
                        Player p = new Player(tfUsername.getText());
                        p.setPhoto("placeholder");
                        GameSession gameSession = new GameSession(p);
                        gameSession.saveUser(p);
                        gameSession.save();
                        openGame(gameSession);
                    }
                }
            }
            System.out.println("Invalid User!!!");
        }
    }

    public void openGame(GameSession gameSession) {
        Stage stage = new Stage();

        FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource("/at/htlvillach/e_22_wordle/hello-view.fxml"));

        Scene scene = null;
        try {
            scene = new Scene(fxmlLoader.load());
        } catch (IOException e) {
            throw new RuntimeException("FXML-Datei konnte in der JAR nicht gefunden werden!", e);
        }

        ((HelloController) fxmlLoader.getController()).setGameSession(gameSession);
        stage.setTitle("Wordle");
        stage.setScene(scene);
        stage.show();

        Stage myStage = (Stage) tfUsername.getScene().getWindow();
        myStage.close();
    }
    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        List<Player> players = DataManager.getInstance().getLeaderboard();
        lvLeaderBoard.setItems(FXCollections.observableList(players));
        lvLeaderBoard.getItems().sort(Comparator.comparingInt(Player::getTotalPoints).reversed());    }
}

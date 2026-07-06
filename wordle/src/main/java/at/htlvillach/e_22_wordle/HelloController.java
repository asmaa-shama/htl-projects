package at.htlvillach.e_22_wordle;

import at.htlvillach.e_22_wordle.model.*;
import javafx.collections.FXCollections;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.GridPane;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.scene.text.Text;
import javafx.stage.Stage;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

public class HelloController {
    public GridPane gpGame;
    public ImageView ivProfile;
    public Label lbTotalPoints ;
    public Label lbHighscore;
    public Label lbUsername;
    public Button btnLogOut;
    @FXML
    private Button btnGuess;

    @FXML
    private Button btnSelectUser;

    @FXML
    private TextField tf1;

    @FXML
    private TextField tf10;

    @FXML
    private TextField tf11;

    @FXML
    private TextField tf12;

    @FXML
    private TextField tf13;

    @FXML
    private TextField tf14;

    @FXML
    private TextField tf15;

    @FXML
    private TextField tf16;

    @FXML
    private TextField tf17;

    @FXML
    private TextField tf18;

    @FXML
    private TextField tf19;

    @FXML
    private TextField tf2;

    @FXML
    private TextField tf20;

    @FXML
    private TextField tf21;

    @FXML
    private TextField tf22;

    @FXML
    private TextField tf23;

    @FXML
    private TextField tf24;

    @FXML
    private TextField tf25;

    @FXML
    private TextField tf26;

    @FXML
    private TextField tf27;

    @FXML
    private TextField tf28;

    @FXML
    private TextField tf29;

    @FXML
    private TextField tf3;

    @FXML
    private TextField tf30;

    @FXML
    private TextField tf4;

    @FXML
    private TextField tf5;

    @FXML
    private TextField tf6;

    @FXML
    private TextField tf7;

    @FXML
    private TextField tf8;

    @FXML
    private TextField tf9;

    @FXML
    private TextField tfGuessInput;

    @FXML
    private TextField tfUsername;

    private GameSession gameSession;
    private WordleGame game;

    List<List<TextField>> textFields;
    int row = 0;

    @FXML
    void onBtnGuess(ActionEvent event) {
        // 1. SCHUTZ: Wenn das Spiel bereits beendet ist, ignorieren wir weitere Klicks komplett
        if (game.isFinished()) {
            return;
        }

        StringBuilder guess = new StringBuilder();
        for (TextField t : textFields.get(row)){
            guess.append(t.getText());
            if (t.getText().isEmpty()){
                System.out.println("Empty textfield");
                return;
            }
        }

        String guessStr = String.valueOf(guess);

        // 2. PRÜFUNG: Ist die Eingabe ein gültiges Wort? Wenn NEIN -> Fehler anzeigen und abbrechen
        if (!game.isValidInput(guessStr)) {
            Alert alert = new Alert(Alert.AlertType.ERROR, "Invalid Input", ButtonType.CLOSE);
            alert.showAndWait();
            System.out.println("invalid input");
            return; // Wichtig: Hier abbrechen, damit nicht weitergegangen wird!
        }

        // 3. LOGIK: Das Wort ist gültig, wir prüfen es im WordleGame
        GuessResult guessResult = game.guess(guessStr);

        int count = 0;
        for (TextField t : textFields.get(row)) {
            LetterState state = guessResult.getLetters().get(count).getState();
            if (state.equals(LetterState.CORRECT)) {
                t.setStyle("-fx-background-color: #6aaa64; -fx-text-inner-color: WHITE; -fx-border-radius: 0px;-fx-background-radius : 0px;");
            } else if (state.equals(LetterState.WRONG_POSITION)) {
                t.setStyle("-fx-background-color: #c9b458; -fx-text-inner-color: WHITE;-fx-border-radius: 0px;-fx-background-radius : 0px;");
            } else if (state.equals(LetterState.NOT_IN_WORD)) {
                t.setStyle("-fx-background-color: #787c7e; -fx-text-inner-color: WHITE;-fx-border-radius: 0px;-fx-background-radius : 0px;");
            }
            count++;
            t.setDisable(true);
        }

        if (!game.isFinished()) {
            row++;
            for (TextField t : textFields.get(row)) {
                t.setDisable(false);
            }
            TextField firstFieldOfNewRow = textFields.get(row).get(0);
            firstFieldOfNewRow.requestFocus();
        } else {
            Player player = gameSession.getPlayer();

            player.setGamesPlayed(player.getGamesPlayed() + 1);

            if (game.getStatus() == GameStatus.WON) {
                int points = 70 - ((row + 1) * 10);
                player.setTotalPoints(player.getTotalPoints() + points);
                player.setHighScore(Math.max(player.getHighScore(), points));
            }

            lbTotalPoints.setText("Totalpoints: " + player.getTotalPoints());
            lbHighscore.setText("Highscore: " + player.getHighScore());

            gameSession.save();
            gameSession.saveUser(player);
            Alert alert = new Alert(Alert.AlertType.NONE, "Game finished! The word happened to be " + game.getWordToGuess(), ButtonType.CLOSE, new ButtonType("Start new Game"));
            btnGuess.setDisable(true);

            Optional<ButtonType> buttonType = alert.showAndWait();
            if (buttonType.isPresent() && buttonType.get().getText().equals("Start new Game")) {
                startNewGame();
            }
        }
    }

    public void setGameSession(GameSession gameSession) {
        this.gameSession = gameSession;
        fillImageView();
        lbHighscore.setText(gameSession.getPlayer().getHighScore() +"");
        lbUsername.setText(gameSession.getPlayer().getName());
        lbTotalPoints.setText(""+gameSession.getPlayer().getTotalPoints());
        game = gameSession.startNewGame();
        System.out.println(game.getWordToGuess());
        textFields = new ArrayList<>(List.of(
                List.of(tf1,tf2,tf3,tf4,tf5),
                List.of(tf6,tf7,tf8,tf9,tf10),
                List.of(tf11,tf12,tf13,tf14,tf15),
                List.of(tf16,tf17,tf18,tf19,tf20),
                List.of(tf21,tf22,tf23,tf24,tf25),
                List.of(tf26,tf27,tf28,tf29,tf30)
        ));
        setTextfields();
    }

    private void setTextfields() {
        List<TextField> flatTextFields = new ArrayList<>();
        for (List<TextField> rowList : textFields) {
            flatTextFields.addAll(rowList);
        }

        for (int i = 0; i < flatTextFields.size(); i++) {
            final int currentIndex = i;
            TextField tf = flatTextFields.get(i);

            tf.setTextFormatter(new TextFormatter<>(change -> {
                if (change.getControlNewText().length() <= 1) {
                    return change;
                }
                return null;
            }));

            tf.setStyle("-fx-border-radius: 0px;" +
                    "-fx-background-radius : 0px;" +
                    "-fx-border-color:#d3d6da;" +
                    "-fx-border-width: 4px;");

            tf.setOnKeyPressed(event -> {
                if (event.getCode() == KeyCode.ENTER) {
                    if (currentIndex < flatTextFields.size() - 1 && (currentIndex + 1) % 5 != 0) {
                        flatTextFields.get(currentIndex + 1).requestFocus();
                    } else {
                        onBtnGuess(new ActionEvent());
                    }
                    event.consume();
                }

                if (event.getCode() == KeyCode.BACK_SPACE) {
                    if (tf.getText().isEmpty() && currentIndex > 0 && currentIndex % 5 != 0) {
                        TextField previousField = flatTextFields.get(currentIndex - 1);
                        previousField.requestFocus();
                        previousField.setText("");
                        event.consume();
                    }
                }
            });
            tf.textProperty().addListener((observable, oldValue, newValue) -> {
                if (!newValue.isEmpty() && currentIndex < flatTextFields.size() - 1 && (currentIndex + 1) % 5 != 0) {
                    flatTextFields.get(currentIndex + 1).requestFocus();
                }
            });
        }
    }

    private void fillImageView() {
            try {
                String path = "images/" + gameSession.getPlayer().getPhoto()+".jpg";
                Image image = new Image(
                        getClass().
                                getResource(path)
                                .toExternalForm());
                ivProfile.setImage(image);
            }catch( Exception ex){
                ivProfile.setImage(null);
            }

    }

    public void onBtnStartNewGame(ActionEvent actionEvent) {
        btnGuess.setDisable(false);
        startNewGame();
    }

    private void startNewGame() {
        this.game = gameSession.startNewGame();
        System.out.println(game.getWordToGuess());
        btnGuess.setDisable(false);
        row = 0;
        for (List<TextField> list : textFields){
            for (TextField tf : list){
                tf.setDisable(true);
                tf.setStyle("-fx-border-radius: 0px;" +
                        "-fx-background-radius : 0px;" +
                        "-fx-border-color:#d3d6da;" +
                        "-fx-border-width: 4px;");
                tf.setText("");
            }
        }
        for (TextField tf : textFields.getFirst()){
            tf.setDisable(false);
        }
    }

    public void onBtnLogOut(ActionEvent actionEvent) {
        Stage stage = (Stage) btnLogOut.getScene().getWindow();
        stage.close();

        Stage newStage = new Stage();
        FXMLLoader fxmlLoader = new FXMLLoader(HelloApplication.class.getResource("log-in.fxml"));
        Scene scene = null;
        try {
            scene = new Scene(fxmlLoader.load());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        newStage.setTitle("Log in!");
        newStage.setScene(scene);
        newStage.show();
    }
}

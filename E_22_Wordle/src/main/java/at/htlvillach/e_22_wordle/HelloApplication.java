package at.htlvillach.e_22_wordle;

import at.htlvillach.e_22_wordle.model.GameSession;
import at.htlvillach.e_22_wordle.model.Player;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;

import java.io.IOException;

public class HelloApplication extends Application {
    @Override
    public void start(Stage stage) throws IOException {
        FXMLLoader fxmlLoader = new FXMLLoader(HelloApplication.class.getResource("log-in.fxml"));
        Scene scene = new Scene(fxmlLoader.load());
        stage.setTitle("Log-In");
        stage.setScene(scene);
        stage.show();
    }
}

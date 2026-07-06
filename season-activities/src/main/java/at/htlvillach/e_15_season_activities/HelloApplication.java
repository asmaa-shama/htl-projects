package at.htlvillach.e_15_season_activities;

import at.htlvillach.e_15_season_activities.repository.DatabaseRepository;
import at.htlvillach.e_15_season_activities.repository.JsonRepo;
import at.htlvillach.e_15_season_activities.repository.SerializationRepo;
import at.htlvillach.e_15_season_activities.service.ActivitiesService;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;

import java.io.IOException;

public class HelloApplication extends Application {
    @Override
    public void start(Stage stage) throws IOException {
        FXMLLoader fxmlLoader = new FXMLLoader(HelloApplication.class.getResource("hello-view.fxml"));
        Scene scene = new Scene(fxmlLoader.load(), 680, 500);
        ((HelloController)fxmlLoader.getController()).setService(new ActivitiesService(new DatabaseRepository()));
        stage.setTitle("Hello!");
        stage.setScene(scene);
        stage.show();
    }
}

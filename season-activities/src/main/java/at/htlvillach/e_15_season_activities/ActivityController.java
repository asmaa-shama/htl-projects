package at.htlvillach.e_15_season_activities;

import at.htlvillach.e_15_season_activities.model.Activity;
import at.htlvillach.e_15_season_activities.model.Person;
import at.htlvillach.e_15_season_activities.model.Season;
import at.htlvillach.e_15_season_activities.service.ActivitiesService;
import at.htlvillach.e_15_season_activities.viewmodel.ActivityViewmodel;
import at.htlvillach.e_15_season_activities.viewmodel.PersonViewmodel;
import javafx.beans.binding.Bindings;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.collections.FXCollections;
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.ListView;
import javafx.scene.control.TextField;

import java.net.URL;
import java.util.ResourceBundle;

public class ActivityController implements Initializable {

    ActivitiesService service;

    public void setService(ActivitiesService service) {
        this.service = service;
        lvActivity.setItems(FXCollections.observableList(ActivityViewmodel.mapList(service.getActivities())));
        if (service.getSeasons()!= null)
            cbSeason.setItems(FXCollections.observableList(service.getSeasons()));
    }

    @FXML
    private Button btnDeleteActivity;

    @FXML
    private Button btnNewActivity;

    @FXML
    private Button btnSaveActivity;

    @FXML
    private ComboBox<Season> cbSeason;

    @FXML
    private ListView<ActivityViewmodel> lvActivity;

    @FXML
    private TextField tfActivityTitle;

    @FXML
    void onBtnDeleteActivityClicked(ActionEvent event) {
        ActivityViewmodel activity = getCurrentActivity();
        service.deleteActivity(activity.getId());
        lvActivity.getItems().remove(getCurrentActivity());
        cbActivities.setItems(FXCollections.observableList(service.getActivities()));
}

    private ActivityViewmodel getCurrentActivity() {
        return lvActivity.getSelectionModel().getSelectedItem();
    }

    @FXML
    void onBtnNewActivityClicked(ActionEvent event) {
        Activity newActivity = new Activity(cbSeason.getItems().getFirst(),"Activity");
        service.insertActivity(newActivity);

        ActivityViewmodel activityViewmodel = new ActivityViewmodel(newActivity);

        lvActivity.getItems().add(activityViewmodel);
        lvActivity.getSelectionModel().selectLast();
        cbActivities.setItems(FXCollections.observableList(service.getActivities()));}

    @FXML
    void onBtnSaveActivityClicked(ActionEvent event) {
        service.updateActivity(getCurrentActivity().toActivity());
        cbActivities.setItems(FXCollections.observableList(service.getActivities()));}


    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        lvActivity.getSelectionModel().selectedItemProperty().addListener(new ChangeListener<ActivityViewmodel>() {
            @Override
            public void changed(ObservableValue<? extends ActivityViewmodel> observableValue, ActivityViewmodel oldValue, ActivityViewmodel newValue) {
                if (oldValue != null){
                    unbindValues(oldValue);
                }
                if (newValue != null){
                    bindValues(newValue);
                }
            }
        });
    }

    private void bindValues(ActivityViewmodel newValue) {
        Bindings.bindBidirectional(tfActivityTitle.textProperty(), newValue.identifierProperty());
        Bindings.bindBidirectional(cbSeason.valueProperty(), newValue.seasonProperty());
    }

    private void unbindValues(ActivityViewmodel oldValue) {
        Bindings.unbindBidirectional(tfActivityTitle.textProperty(), oldValue.identifierProperty());
        Bindings.unbindBidirectional(cbSeason.valueProperty(), oldValue.seasonProperty());
    }
    ComboBox<Activity> cbActivities;
    public void getCB(ComboBox<Activity> cbActivities) {
        this.cbActivities = cbActivities;
    }
}


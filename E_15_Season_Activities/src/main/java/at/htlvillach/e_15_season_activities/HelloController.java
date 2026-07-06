package at.htlvillach.e_15_season_activities;

import at.htlvillach.e_15_season_activities.model.Activity;
import at.htlvillach.e_15_season_activities.model.Person;
import at.htlvillach.e_15_season_activities.service.ActivitiesService;
import at.htlvillach.e_15_season_activities.viewmodel.PersonViewmodel;
import javafx.beans.binding.Bindings;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
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
import java.util.Optional;
import java.util.ResourceBundle;

public class HelloController implements Initializable {

    @FXML
    private Button btnCancle;

    @FXML
    private Button btnEditActivities;

    @FXML
    private Button btnSave;

    @FXML
    private ComboBox<Activity> cbActivities;

    @FXML
    private ListView<PersonViewmodel> lvPersons;

    @FXML
    private TextField tfFirstname;

    @FXML
    private TextField tfLastname;

    ActivitiesService service;

    private PersonViewmodel personCopy;

    public void setService(ActivitiesService service) {
        this.service = service;
        lvPersons.setItems(FXCollections.observableList(PersonViewmodel.mapList(service.findAll())));
        if (service.getActivities() != null) {
            cbActivities.setItems(FXCollections.observableList(service.getActivities()));
        }

    }

    @FXML
    void onBtnCancleClicked(ActionEvent event) {
        PersonViewmodel selectedPerson = getCurrentPerson();
        if (selectedPerson != null) {
            unbindValues(selectedPerson);

            selectedPerson.setFirstnameViewmodel(personCopy.getFirstnameViewmodel());
            selectedPerson.setLastnameViewmodel(personCopy.getLastnameViewmodel());
            selectedPerson.setActivityViewmodel(personCopy.getActivityViewmodel());

            bindValues(selectedPerson);
        }

    }

    @FXML
    void onBtnSaveClicked(ActionEvent event) {
        if (getCurrentPerson() != null) {
            service.update(getCurrentPerson().toPerson());
            personCopy = new PersonViewmodel(getCurrentPerson().toPerson());
        }
    }

    @FXML
    void onEditActivitiesClicked(ActionEvent event) throws IOException {
        Stage stage = new Stage();
        FXMLLoader fxmlLoader = new FXMLLoader(HelloApplication.class.getResource("activity-view.fxml"));
        Scene scene = new Scene(fxmlLoader.load(), 650, 470);
        scene.getStylesheets().add(getClass().getResource("styles.css").toExternalForm());
        ((ActivityController) fxmlLoader.getController()).setService(service);
        ((ActivityController) fxmlLoader.getController()).getCB(cbActivities);
        stage.setTitle("Edit");
        stage.setScene(scene);
        stage.show();
    }


    public void onNewClicked(ActionEvent actionEvent) {
        Person newPerson = new Person("Firstname", "Lastname", cbActivities.getItems().getFirst());
        service.insert(newPerson);

        PersonViewmodel personViewmodel = new PersonViewmodel(newPerson);

        lvPersons.getItems().add(personViewmodel);
        lvPersons.getSelectionModel().select(personViewmodel);
    }

    public void onDeleteClicked(ActionEvent actionEvent) {
        PersonViewmodel person = getCurrentPerson();
        service.delete(person.idViewmodelProperty().get());
        lvPersons.getItems().remove(person);
        lvPersons.getSelectionModel().selectLast();
    }

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        lvPersons.getSelectionModel().selectedItemProperty().addListener(new ChangeListener<PersonViewmodel>() {
            @Override
            public void changed(ObservableValue<? extends PersonViewmodel> observableValue, PersonViewmodel oldValue, PersonViewmodel newValue) {
                if (oldValue != null) {
                    checkChanges(oldValue);
                    unbindValues(oldValue);
                }
                if (newValue != null) {
                    bindValues(newValue);
                    personCopy = new PersonViewmodel(newValue.toPerson());
                }
            }
        });
    }

    private void checkChanges(PersonViewmodel oldValue) {
        if (!personCopy.getFirstnameViewmodel().equals(oldValue.getFirstnameViewmodel()) ||
                !personCopy.getLastnameViewmodel().equals(oldValue.getLastnameViewmodel()) ||
                !personCopy.getActivityViewmodel().equals(oldValue.getActivityViewmodel())) {

            Alert alert = new Alert(Alert.AlertType.WARNING,
                    "Do you want to save your changes?",
                    ButtonType.YES, ButtonType.NO);

            Optional<ButtonType> result = alert.showAndWait();

            if (result.isPresent()) {
                if (result.get() == ButtonType.YES) {
                    service.update(getCurrentPerson().toPerson());
                    personCopy = new PersonViewmodel(getCurrentPerson().toPerson());
                } else {

                    oldValue.setFirstnameViewmodel(personCopy.getFirstnameViewmodel());
                    oldValue.setLastnameViewmodel(personCopy.getLastnameViewmodel());
                    oldValue.setActivityViewmodel(personCopy.getActivityViewmodel());
                }
            }
        }
    }

    private void bindValues(PersonViewmodel person) {
        Bindings.bindBidirectional(tfFirstname.textProperty(), person.firstnameViewmodelProperty());
        Bindings.bindBidirectional(tfLastname.textProperty(), person.lastnameViewmodelProperty());
        Bindings.bindBidirectional(cbActivities.valueProperty(), person.activityViewmodelProperty());
    }

    private void unbindValues(PersonViewmodel person) {
        Bindings.unbindBidirectional(tfFirstname.textProperty(), person.firstnameViewmodelProperty());
        Bindings.unbindBidirectional(tfLastname.textProperty(), person.lastnameViewmodelProperty());
        Bindings.unbindBidirectional(cbActivities.valueProperty(), person.activityViewmodelProperty());
    }

    public PersonViewmodel getCurrentPerson() {
        return lvPersons.getSelectionModel().getSelectedItem();
    }
}

module at.htlvillach.e_22_wordle {
    requires javafx.controls;
    requires javafx.fxml;
    requires  javafx.graphics;
    requires org.kordamp.bootstrapfx.core;
    requires java.desktop;
    requires javafx.base;

    opens at.htlvillach.e_22_wordle to javafx.fxml;
    opens at.htlvillach.e_22_wordle.model to javafx.fxml;
    exports at.htlvillach.e_22_wordle;
}
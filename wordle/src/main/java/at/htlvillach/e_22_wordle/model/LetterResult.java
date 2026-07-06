package at.htlvillach.e_22_wordle.model;

import java.io.Serializable;

public class LetterResult implements Serializable {
    private char letter;
    private LetterState state;

    public LetterResult(char letter) {
        this.letter = letter;
    }

    public void setLetter(char letter) {
        this.letter = letter;
    }

    public void setState(LetterState state) {
        this.state = state;
    }

    public LetterState getState() {
        return state;
    }

    public char getLetter() {
        return letter;
    }
}

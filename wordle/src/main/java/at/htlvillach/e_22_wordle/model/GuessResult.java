package at.htlvillach.e_22_wordle.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class GuessResult implements Serializable {
    private String input;
    private List<LetterResult> letters = new ArrayList<>();

    public GuessResult(String input) {
        this.input = input;
    }
    public void addLetters(LetterResult l){
        letters.add(l);
    }

    public List<LetterResult> getLetters() {
        return letters;
    }
}

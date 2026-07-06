package at.htlvillach.e_22_wordle.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class WordleGame implements Serializable {
    private String wordToGuess;
    private int maxTries = 6;
    private int points;
    private int triesUsed;
    private GameStatus status = GameStatus.RUNNING;
    private List<GuessResult> guesses = new ArrayList<>();

    public WordleGame(String wordToGuess) {
        this.wordToGuess = wordToGuess;
    }

    public boolean isValidInput(String input) {
        if (input == null || input.isBlank()) {
            return false;
        }
        input = input.toUpperCase();
        for (int i = 0; i < input.length(); i++) {
            if (input.charAt(i) < 'A' || input.charAt(i) > 'Z') {
                return false;
            }
        }
        return true;
    }

    public GuessResult guess(String input) {
        input = input.toUpperCase();
        GuessResult guessResult = new GuessResult(input);
        guesses.add(guessResult);

        int length = input.length();
        LetterResult[] results = new LetterResult[length];

        java.util.Map<Character, Integer> targetLetterCounts = new java.util.HashMap<>();
        for (int i = 0; i < wordToGuess.length(); i++) {
            char c = wordToGuess.charAt(i);
            targetLetterCounts.put(c, targetLetterCounts.getOrDefault(c, 0) + 1);
        }

        for (int i = 0; i < length; i++) {
            char inputChar = input.charAt(i);
            results[i] = new LetterResult(inputChar);

            if (inputChar == wordToGuess.charAt(i)) {
                results[i].setState(LetterState.CORRECT);
                targetLetterCounts.put(inputChar, targetLetterCounts.get(inputChar) - 1);
            }
        }

        for (int i = 0; i < length; i++) {
            if (results[i].getState() == LetterState.CORRECT) {
                continue;
            }

            char inputChar = input.charAt(i);

            if (targetLetterCounts.getOrDefault(inputChar, 0) > 0) {
                results[i].setState(LetterState.WRONG_POSITION);
                targetLetterCounts.put(inputChar, targetLetterCounts.get(inputChar) - 1);
            } else {
                results[i].setState(LetterState.NOT_IN_WORD);
            }
        }

        for (LetterResult lr : results) {
            guessResult.addLetters(lr);
        }
        boolean won = true;
        for (LetterResult l : guessResult.getLetters()) {
            if (!l.getState().equals(LetterState.CORRECT)) {
                won = false;
                break;
            }
        }

        if (won) {
            status = GameStatus.WON;
        }

        triesUsed++;
        if (maxTries <= triesUsed && status != GameStatus.WON) {
            status = GameStatus.LOST;
        }

        return guessResult;
    }

    public boolean isFinished(){
        return status.equals(GameStatus.LOST) || status.equals(GameStatus.WON);
    }

    public String getWordToGuess() {
        return wordToGuess;
    }

    public void setWordToGuess(String wordToGuess) {
        this.wordToGuess = wordToGuess;
    }

    public int getMaxTries() {
        return maxTries;
    }

    public void setMaxTries(int maxTries) {
        this.maxTries = maxTries;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public GameStatus getStatus() {
        return status;
    }

    public void setStatus(GameStatus status) {
        this.status = status;
    }

    public List<GuessResult> getGuesses() {
        return guesses;
    }

    public void setGuesses(List<GuessResult> guesses) {
        this.guesses = guesses;
    }
}

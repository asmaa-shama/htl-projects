package at.htlvillach.e_22_wordle.model;


public class Start {
    public static void main(String[] args) {
        System.out.println(DataManager.getInstance().getWords());
        System.out.println(DataManager.getInstance().getLeaderboard());
    }
}

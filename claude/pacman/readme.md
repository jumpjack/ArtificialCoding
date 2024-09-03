Three iterations and 1 small edit were enough to recreate a fully functional "PacMan".

- 1st iteration:
    - Prompt: Recreate pacman in HTML5
    - [Result](https://jumpjack.github.io/ArtificialCoding/claude/pacman/001.html)
    - Comment: Pacman does not eat balls, there are no "special balls" at corners, erro while moving left; and there are no ghosts
- 2nd iteration:
    - Prompt: Okay, now let's add the logic:
        - Whenever the player moves over a dot, the dot should disappear, and the score should increase by 10 points.
        - When the player moves to the left, the Pacman image should change accordingly.
        - At the 4 corners, there should be 4 larger dots that are worth 100 points each and make Pacman invincible for 10 seconds (add a timer).
    - **Result**
    - Comment: Pacman now is working fine, but no ghosts
  - 3d iteration:
    - Prompt: Add ghosts
    - **Result**
    - Comment: ghosts are too fast
- 4th iteration:
    - Prompt: slow down ghosts
    - **Result**: AI starts getting confused, game stops working; I manually add a delay in ghosts movement; result: **a fully functional PacAIman**!


![image](https://github.com/user-attachments/assets/0c70cf50-436b-4fd1-881e-42cb17d201e0)

Three iterations and some minor manual edits were enough to recreate a fully functional "PacMan".

- 1st iteration:
    - Prompt: _Recreate pacman in HTML5_
    - [Result](https://jumpjack.github.io/ArtificialCoding/claude/pacman/001.html)
    - Comment: Pacman does not eat its ~~vegetables~~ balls; there are no "special balls" at corners; bad pacman shape while moving left;  there are no ghosts.
- 2nd iteration:
    - Prompt: _Okay, now let's add the logic:_
        - _Whenever the player moves over a dot, the dot should disappear, and the score should increase by 10 points._
        - _When the player moves to the left, the Pacman image should change accordingly._
        - _At the 4 corners, there should be 4 larger dots that are worth 100 points each and make Pacman invincible for 10 seconds (add a timer)_.
    - [Result](https://jumpjack.github.io/ArtificialCoding/claude/pacman/002.html)
    - Comment: Pacman now is working fine, but no ghosts
- 3d iteration:
    - Prompt: _Add ghosts_
    - [Result](https://jumpjack.github.io/ArtificialCoding/claude/pacman/003.html)
    - Comment: ghosts are too fast
- 4th iteration:
    - Prompt: _slow down ghosts_
    - [Result](https://jumpjack.github.io/ArtificialCoding/claude/pacman/004.html): AI starts getting confused, game stops working; I manually add a delay in ghosts movement; result: - [A fully functional PacAIman](https://jumpjack.github.io/ArtificialCoding/claude/pacman/003-mod.html)!
- [Final manual edit](https://jumpjack.github.io/ArtificialCoding/claude/pacman/003-mod2.html): added balls count to finish game with "You won!" message.
 
[Link to original chat](https://claude.ai/chat/9f730896-168f-4572-943b-0c93916c34c1).

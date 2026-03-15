# Lost Explorer

A 2D platformer game built with [Phaser 3](https://phaser.io/), where you guide an explorer through a series of puzzle-filled chambers to find a hidden treasure.

## Game Story

You are the **Lost Explorer**, trapped deep within a mysterious set of ancient chambers. Your only way out is forward. You must use your wits and agility to navigate treacherous platforms, collect powerful artifacts, and unlock the path to the final treasure to secure your escape.

## Gameplay

The game is divided into three distinct levels, each with a unique objective.

### Level 1: The Crystal Cave
*   **Objective**: Collect all 6 falling crystals.
*   **Details**: The crystals power up an ancient portal. Once all are collected, the portal to the next chamber will appear.

### Level 2: The Key Chamber
*   **Objective**: Find the key to unlock the next portal.
*   **Details**: This chamber introduces more complex platforming challenges and ladders. You must navigate the platforms to reach the key. The portal to the final room will not open without it!

### Level 3: The Treasure Room
*   **Objective**: Find the final key and reach the trophy.
*   **Details**: The final test of your skills. Navigate a maze of platforms and ladders to find one last key, which grants you access to the ultimate prize—the ancient trophy. Claim it to win the game!

## Controls

*   **Left / Right Arrows**: Move the player left and right.
*   **Up Arrow**: Jump (when on the ground) or climb up a ladder.
*   **Down Arrow**: Climb down a ladder.

## How to Run

Because this game loads images, modern web browsers require it to be run from a local web server for security reasons. You cannot simply open the `index.html` file directly in your browser.

### Option 1: VS Code & Live Server (Recommended)
1.  Open the project folder in Visual Studio Code.
2.  Install the **Live Server** extension from the marketplace.
3.  Right-click on `index.html` in the file explorer and select **Open with Live Server**.

### Option 2: Using Python
If you have Python installed, you can easily start a simple web server.
1.  Open a terminal or command prompt in the root directory of the game.
2.  Run the following command:
    ```bash
    # For Python 3
    python -m http.server
    ```
3.  Open your web browser and navigate to `http://localhost:8000`.

## Project Files

*   `index.html`: The main HTML file that loads the Phaser framework and the game script.
*   `game.js`: Contains all the core game logic, including scene setup, player controls, and the progression through the three levels.
*   `assets/`: A directory containing all the game's visual assets, such as sprites for the player, items, and background images.
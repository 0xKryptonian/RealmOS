# AI Game Generator - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Add OpenAI API Key

Create or edit `.env.local`:

```bash
OPENAI_API_KEY="sk-proj-..."
```

Get your API key from: https://platform.openai.com/api-keys

### Step 2: Start the Server

```bash
bun dev
```

### Step 3: Create Your First Game

1. Open browser: `http://localhost:3000/create-game`
2. Enter prompt: **"Create a space shooter with power-ups"**
3. Click **"Generate Game"**
4. Wait 10-20 seconds
5. Play your game!

## 📝 Example Prompts

Try these prompts:

```
Create a space shooter with enemies and power-ups
```

```
Make a platformer where you collect coins and jump over obstacles
```

```
Build a game where the player dodges falling asteroids
```

## 🎮 How It Works

1. **You describe** the game in plain English
2. **GPT-4 understands** and creates a structured game plan
3. **Phaser.js template** generates playable HTML/JavaScript
4. **Play instantly** in your browser
5. **Download** as standalone HTML file

## 🎯 What You Get

- ✅ Fully playable game
- ✅ Keyboard controls
- ✅ Score tracking
- ✅ Game over screen
- ✅ Downloadable HTML file
- ✅ No dependencies (works offline after download)

## 🎨 Supported Game Types

Currently available:
- **Shooter** - Space invaders style
- **Platformer** - Jump and collect

Coming soon:
- Puzzle games
- Racing games
- Card games

## 💡 Tips

1. **Be specific** - "space shooter with 3 types of enemies" is better than "shooter"
2. **Mention mechanics** - "collect power-ups for faster shooting"
3. **Keep it simple** - Complex games may not work well yet
4. **Test controls** - Arrow keys + Space bar for most games

## 🐛 Troubleshooting

**Game not generating?**
- Check if `OPENAI_API_KEY` is set
- Check browser console for errors
- Try a simpler prompt

**Game not rendering?**
- Refresh the page
- Check internet connection (Phaser.js loads from CDN)
- Try a different browser

**Controls not working?**
- Click inside the game area
- Use arrow keys + space bar
- Check game instructions in the spec

## 📊 Cost

Each game generation costs approximately **$0.01-0.03** in OpenAI API credits.

## 🔗 Next Steps

1. Generate a few games to test
2. Download and share your games
3. Provide feedback for improvements
4. Check `AI_GAME_GENERATOR_README.md` for advanced usage

## 🎉 That's It!

You're ready to create AI-generated games. Have fun! 🚀

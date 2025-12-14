import { describe, it, expect } from 'vitest';
import { generateDynamicGame } from '../dynamic-game-generator';
import { GameDesign } from '@/types/game-design';

describe('generateDynamicGame', () => {
    it('should generate valid Phaser game code', () => {
        const mockDesign: GameDesign = {
            title: 'Test Game',
            subcategory: 'Platformer',
            description: 'A test game',
            visuals: {
                colorScheme: 'retro',
                style: 'pixel',
                theme: 'sci-fi',
                assets: {
                    background_style: 'stars'
                }
            },
            config: {
                width: 800,
                height: 600,
                fps: 60,
                physics: 'arcade'
            },
            gameDesign: {
                core_mechanic: 'jumping',
                player_abilities: ['double_jump'],
                lose_condition: 'lose_health',
                player: { type: 'robot', health: 3, speed: 200, abilities: [], controls: ['arrows'] },
                enemy_types: [{ name: 'alien', behavior: 'chase', health: 1, speed: 50, points: 10 }],
                win_condition: 'Survive',
                progression: { difficulty_curve: 'linear' }
            }
        };

        const code = generateDynamicGame(mockDesign);

        expect(code).toContain('new Phaser.Game');
        expect(code).toContain('preload');
        expect(code).toContain('create');
        expect(code).toContain('update');
        expect(code).toContain('Test Game'); // Title check
        expect(code).toContain('width: 800');
        expect(code).toContain('height: 600');
    });
});

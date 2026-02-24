/**
 * GameView — renders the game grid with Pacman-style robot, walls, and goal.
 * Driven by the current animation step from gameEngine.executeBlocks().
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const CELL = 62;

const COLORS = {
  floor:     '#EEF2F7',
  floorAlt:  '#E2E8F0',
  wall:      '#2C3E50',
  wallLine:  'rgba(255,255,255,0.18)',
  goal:      '#27AE60',
  goalDark:  '#1E8449',
  pac:       '#FFD700',
  eye:       '#333',
};

// ─── Pacman (SVG pie slice) ──────────────────────────────────────────────────

function Pacman({ size, direction }) {
  const ROTATION = { right: 0, down: 90, left: 180, up: 270 };
  const deg = ROTATION[direction] ?? 0;
  const r = size / 2;
  const mouth = 30 * (Math.PI / 180); // 30° half-angle

  // Mouth opens to the right. Top lip = angle -30°, bottom lip = +30°
  const topX = r + r * Math.cos(mouth);
  const topY = r - r * Math.sin(mouth);
  const botX = r + r * Math.cos(mouth);
  const botY = r + r * Math.sin(mouth);

  // Large arc counterclockwise = the body (from top lip, the long way to bot lip)
  const d = `M ${r} ${r} L ${topX} ${topY} A ${r} ${r} 0 1 0 ${botX} ${botY} Z`;

  // Eye sits in the upper-left quadrant of the Pacman body
  const eyeX = r - r * 0.18;
  const eyeY = r - r * 0.46;

  return (
    <Svg
      width={size}
      height={size}
      style={{ transform: [{ rotate: `${deg}deg` }] }}
    >
      <Path d={d} fill={COLORS.pac} />
      <Circle cx={eyeX} cy={eyeY} r={r * 0.11} fill={COLORS.eye} />
    </Svg>
  );
}

// ─── Cell renderers ──────────────────────────────────────────────────────────

function WallCell() {
  return (
    <View style={[styles.cell, { backgroundColor: COLORS.wall }]}>
      {/* Horizontal mortar lines */}
      <View style={[styles.brickH, { top: '33%' }]} />
      <View style={[styles.brickH, { top: '66%' }]} />
      {/* Staggered vertical joints */}
      <View style={[styles.brickV, { left: '50%', bottom: '34%', top: 0 }]} />
      <View style={[styles.brickV, { left: '25%', top: '66%', bottom: 0 }]} />
      <View style={[styles.brickV, { left: '75%', top: '66%', bottom: 0 }]} />
    </View>
  );
}

function GoalCell({ robotHere }) {
  return (
    <View style={[styles.cell, { backgroundColor: COLORS.goal }]}>
      {!robotHere && (
        <>
          <View style={[styles.goalStripe, { top: '0%', bottom: '66%' }]} />
          <View style={[styles.goalStripe, { top: '33%', bottom: '33%' }]} />
          <View style={[styles.goalStripe, { top: '66%', bottom: '0%' }]} />
          <Text style={styles.goalEmoji}>🚪</Text>
        </>
      )}
    </View>
  );
}

// ─── Main GameView ───────────────────────────────────────────────────────────

export default function GameView({ layout, currentStep, stepMessage }) {
  const { grid, cols, rows } = layout;
  const robot = currentStep?.robot ?? { col: layout.robotStart.x, row: layout.robotStart.y, dir: layout.robotDir ?? 'right' };
  const atGoal = currentStep?.atGoal ?? false;

  const cells = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const val = grid[row]?.[col] ?? 0;
      const isWallCell = val === 1;
      const isGoalCell = val === 2;
      const isRobot = robot.col === col && robot.row === row;
      const isCheckerDark = (col + row) % 2 === 1;

      cells.push(
        <View
          key={`${col}-${row}`}
          style={[
            styles.cell,
            {
              position: 'absolute',
              left: col * CELL,
              top:  row * CELL,
              backgroundColor: isWallCell
                ? COLORS.wall
                : isGoalCell
                  ? COLORS.goal
                  : isCheckerDark ? COLORS.floorAlt : COLORS.floor,
            },
          ]}
        >
          {isWallCell && (
            <>
              <View style={[styles.brickH, { top: '33%' }]} />
              <View style={[styles.brickH, { top: '66%' }]} />
              <View style={[styles.brickV, { left: '50%', bottom: '34%', top: 0 }]} />
              <View style={[styles.brickV, { left: '25%', top: '66%', bottom: 0 }]} />
              <View style={[styles.brickV, { left: '75%', top: '66%', bottom: 0 }]} />
            </>
          )}
          {isGoalCell && !isRobot && (
            <Text style={styles.goalEmoji}>🚪</Text>
          )}
          {isRobot && (
            <View style={styles.robotCell}>
              <Pacman size={CELL - 12} direction={robot.dir} />
            </View>
          )}
        </View>
      );
    }
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.grid, { width: cols * CELL, height: rows * CELL }]}>
        {cells}
      </View>

      {/* Step message bubble */}
      <View style={[styles.bubble, atGoal && styles.bubbleWin]}>
        <Text style={styles.bubbleText}>
          {atGoal ? '🎉 Made it to the exit!' : (stepMessage ?? 'Tell ROVI what to do!')}
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: 12,
  },
  grid: {
    position: 'relative',
    borderWidth: 3,
    borderColor: COLORS.wall,
    borderRadius: 6,
    overflow: 'hidden',
  },
  cell: {
    width: CELL,
    height: CELL,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  brickH: {
    position: 'absolute',
    left: 0, right: 0,
    height: 1,
    backgroundColor: COLORS.wallLine,
  },
  brickV: {
    position: 'absolute',
    width: 1,
    backgroundColor: COLORS.wallLine,
  },
  goalEmoji: {
    fontSize: CELL * 0.48,
    position: 'absolute',
  },
  goalStripe: {
    position: 'absolute',
    left: 0, right: 0,
    backgroundColor: COLORS.goalDark,
    opacity: 0.3,
  },
  robotCell: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    marginTop: 10,
    backgroundColor: '#5B4FE9',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    maxWidth: 340,
  },
  bubbleWin: {
    backgroundColor: '#27AE60',
  },
  bubbleText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
});

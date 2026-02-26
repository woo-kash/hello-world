/**
 * GameView — renders the game grid with Pacman-style robot, walls, and goal.
 * Driven by the current animation step from gameEngine.executeBlocks().
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Rect, Line } from 'react-native-svg';

const CELL = 62;

const COLORS = {
  floor:     '#EEF2F7',
  floorAlt:  '#E2E8F0',
  wall:      '#2C3E50',
  wallLine:  'rgba(255,255,255,0.18)',
  goal:      '#27AE60',
  goalDark:  '#1E8449',
};

// ─── Robot (SVG) ─────────────────────────────────────────────────────────────

function Robot({ size, direction }) {
  const ROTATION = { right: 90, down: 180, left: 270, up: 0 };
  const deg = ROTATION[direction] ?? 90;
  const s = size;

  return (
    <Svg
      width={s}
      height={s}
      style={{ transform: [{ rotate: `${deg}deg` }] }}
    >
      {/* Antenna */}
      <Rect x={s * 0.45} y={s * 0.02} width={s * 0.1} height={s * 0.16} rx={s * 0.05} fill="#5B4FE9" />
      <Circle cx={s * 0.5} cy={s * 0.02} r={s * 0.09} fill="#FFD700" />
      {/* Head */}
      <Rect x={s * 0.15} y={s * 0.16} width={s * 0.7} height={s * 0.52} rx={s * 0.12} fill="#7EC8E3" />
      {/* Eyes */}
      <Circle cx={s * 0.35} cy={s * 0.36} r={s * 0.11} fill="white" />
      <Circle cx={s * 0.65} cy={s * 0.36} r={s * 0.11} fill="white" />
      <Circle cx={s * 0.37} cy={s * 0.36} r={s * 0.065} fill="#1a1a2e" />
      <Circle cx={s * 0.67} cy={s * 0.36} r={s * 0.065} fill="#1a1a2e" />
      {/* Mouth */}
      <Rect x={s * 0.28} y={s * 0.56} width={s * 0.44} height={s * 0.08} rx={s * 0.04} fill="#5B4FE9" />
      {/* Direction arrow on forehead */}
      <Line x1={s * 0.5} y1={s * 0.2} x2={s * 0.5} y2={s * 0.12} stroke="#fff" strokeWidth={s * 0.04} strokeLinecap="round" />
      <Line x1={s * 0.5} y1={s * 0.12} x2={s * 0.43} y2={s * 0.19} stroke="#fff" strokeWidth={s * 0.04} strokeLinecap="round" />
      <Line x1={s * 0.5} y1={s * 0.12} x2={s * 0.57} y2={s * 0.19} stroke="#fff" strokeWidth={s * 0.04} strokeLinecap="round" />
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
              <Robot size={CELL - 8} direction={robot.dir} />
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

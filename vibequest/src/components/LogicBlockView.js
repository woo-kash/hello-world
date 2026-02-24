/**
 * LogicBlockView — renders AI-generated logic blocks as visual puzzle pieces.
 * Shows kids WHAT they built in a visual way, then reveals the real code.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';

const BLOCK_COLORS = {
  if: '#FF6B6B',
  else: '#FF8E53',
  loop: '#4ECDC4',
  action: '#45B7D1',
  condition: '#96CEB4',
};

const BLOCK_ICONS = {
  if: '❓',
  else: '↩️',
  loop: '🔄',
  action: '⚡',
  condition: '🔍',
};

function LogicBlock({ block, depth = 0 }) {
  const color = BLOCK_COLORS[block.type] || '#888';
  const icon = BLOCK_ICONS[block.type] || '📦';
  const indent = depth * 16;

  return (
    <View style={[styles.blockWrapper, { marginLeft: indent }]}>
      <View style={[styles.block, { backgroundColor: color }]}>
        <Text style={styles.blockIcon}>{icon}</Text>
        <Text style={styles.blockLabel}>{block.label}</Text>
      </View>
      {block.children?.map((child, i) => (
        <LogicBlock key={i} block={child} depth={depth + 1} />
      ))}
    </View>
  );
}

export default function LogicBlockView({ logicBlocks, code, explanation }) {
  const [showCode, setShowCode] = useState(false);

  if (!logicBlocks || logicBlocks.length === 0) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Your Logic</Text>
      <View style={styles.blocksContainer}>
        {logicBlocks.map((block, i) => (
          <LogicBlock key={i} block={block} />
        ))}
      </View>

      <TouchableOpacity
        style={styles.codeToggle}
        onPress={() => setShowCode(prev => !prev)}
      >
        <Text style={styles.codeToggleText}>
          {showCode ? 'Hide real code ▲' : 'See the real code ▼'}
        </Text>
      </TouchableOpacity>

      {showCode && (
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{code}</Text>
        </View>
      )}

      {explanation && (
        <View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>What you just learned:</Text>
          <Text style={styles.explanationText}>{explanation}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  blocksContainer: { marginBottom: 16 },
  blockWrapper: { marginBottom: 6 },
  block: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  blockIcon: { fontSize: 16, marginRight: 8 },
  blockLabel: { color: '#fff', fontWeight: '600', fontSize: 14, flex: 1 },
  codeToggle: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 8,
  },
  codeToggleText: { color: '#3498DB', fontWeight: '600', fontSize: 14 },
  codeBox: {
    backgroundColor: '#1E1E2E',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  codeText: {
    color: '#CDD6F4',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  explanationBox: {
    backgroundColor: '#EAF6FF',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  explanationTitle: { fontWeight: 'bold', color: '#2C3E50', marginBottom: 4 },
  explanationText: { color: '#34495E', fontSize: 14, lineHeight: 20 },
});

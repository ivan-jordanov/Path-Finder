import React from 'react';
import { View, Text } from 'react-native';
import { formatDistance, formatDuration, formatSpeed } from '../utils/formatters';

/**
 * Displays live or summary tracking statistics in a horizontal bar.
 *
 * Props:
 *  - distance {number}  metres
 *  - duration {number}  seconds
 *  - speed    {number}  m/s  (optional – omitted when showing a summary)
 */
export default function StatsBar({ distance = 0, duration = 0, speed }) {
  const showSpeed = speed !== undefined;

  return (
    <View className="flex-row justify-around items-center bg-parchment-dark rounded-[18px] px-4 py-3 mx-4 my-2 border border-sand shadow-sm elevation-4">
      <StatItem label="Distance" value={formatDistance(distance)} />
      <View className="w-px h-8 bg-sand" />
      <StatItem label="Duration" value={formatDuration(duration)} />
      {showSpeed && (
        <>
          <View className="w-px h-8 bg-sand" />
          <StatItem label="Avg Speed" value={formatSpeed(speed)} />
        </>
      )}
    </View>
  );
}

function StatItem({ label, value }) {
  return (
    <View className="items-center">
      <Text className="text-[10px] text-ink-muted uppercase tracking-[0.8px] mb-0.5 font-semibold">
        {label}
      </Text>
      <Text className="text-base font-bold text-ink">{value}</Text>
    </View>
  );
}

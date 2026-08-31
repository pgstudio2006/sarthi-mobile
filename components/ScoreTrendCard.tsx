import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { useResponsive } from '../utils/responsive';
import { colors } from '../theme/colors';

type TrendPoint = { score: number; date?: string };
type ScoreTrendCardProps = {
  currentScore: number;
  previousScore: number;
  history?: TrendPoint[];
  improvedLabel: string;
  needsAttentionLabel: string;
  title: string;
  previousDate?: string;
  currentDate?: string;
};

export default function ScoreTrendCard({
  currentScore,
  previousScore,
  history,
  improvedLabel,
  needsAttentionLabel,
  title,
  previousDate,
  currentDate,
}: ScoreTrendCardProps) {
  const { width, scale } = useResponsive();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const s = (value: number) => value * Math.min(scale, 1);
  const sourcePoints = (history?.length ? history : [
    { score: previousScore, date: previousDate },
    { score: currentScore, date: currentDate },
  ]).map((point) => ({ ...point, score: Math.min(200, Math.max(0, Number(point.score) || 0)) }));
  const points = sourcePoints.length > 1 ? sourcePoints : [{ score: previousScore, date: previousDate }, { score: currentScore, date: currentDate }];
  const previousIndex = Math.max(0, points.length - 2);
  const latestIndex = points.length - 1;
  const firstScore = points[previousIndex].score;
  const lastScore = points[latestIndex].score;
  const diff = lastScore - firstScore;
  const improved = diff < 0;
  const unchanged = diff === 0;
  const percent = Math.round((Math.abs(diff) / Math.max(1, firstScore)) * 100);
  const lineColor = improved ? '#5664DD' : unchanged ? '#6B7180' : '#E25648';
  const trendColor = improved ? '#59B94B' : unchanged ? '#6B7180' : '#E25648';
  const trendBg = improved ? '#E8F7D8' : unchanged ? '#F4F5F5' : '#FDF0EB';
  const trendLabel = unchanged ? 'No change' : improved ? `↓ ${percent}% ${improvedLabel}` : `↑ ${percent}% ${needsAttentionLabel}`;

  const chartWidth = Math.min(width - s(64), s(360));
  const chartHeight = s(270);
  const plotLeft = s(42);
  const plotRight = chartWidth - s(18);
  const plotTop = s(42);
  const plotBottom = s(190);
  const minScore = Math.max(0, Math.floor((Math.min(...points.map((p) => p.score)) - 10) / 10) * 10);
  const maxScore = Math.min(200, Math.ceil((Math.max(...points.map((p) => p.score)) + 10) / 10) * 10);
  const y = (score: number) => plotBottom - ((score - minScore) / Math.max(1, maxScore - minScore)) * (plotBottom - plotTop);
  const x = (index: number) => points.length === 1 ? (plotLeft + plotRight) / 2 : plotLeft + (index / (points.length - 1)) * (plotRight - plotLeft);
  const dateLabel = (point: TrendPoint) => (point.date || '').replace('January', 'Jan').replace('February', 'Feb').replace('March', 'Mar').replace('April', 'Apr').replace('August', 'Aug').replace('September', 'Sep').replace('October', 'Oct').replace('November', 'Nov').replace('December', 'Dec');
  const polylinePoints = points.map((point, index) => `${x(index)},${y(point.score)}`).join(' ');
  const areaPoints = `${plotLeft},${plotBottom} ${polylinePoints} ${plotRight},${plotBottom}`;
  const tickValues = [maxScore, maxScore - (maxScore - minScore) / 3, maxScore - (2 * (maxScore - minScore)) / 3, minScore];

  return (
    <View style={[styles.card, { padding: s(18), borderRadius: s(24), marginBottom: s(16) }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: s(16) }]}>{title}</Text>
        <View style={[styles.badge, { backgroundColor: trendBg, borderRadius: s(16), paddingHorizontal: s(10), paddingVertical: s(5) }]}>
          <Text style={[styles.badgeText, { color: trendColor, fontSize: s(11), flexShrink: 1 }]}>{trendLabel}</Text>
        </View>
      </View>

      <Svg width={chartWidth} height={chartHeight}>
        <Polygon points={areaPoints} fill="#F1F4FF" />
        {tickValues.map((tick, index) => {
          const tickY = y(tick);
          return (
            <React.Fragment key={index}>
              <Line x1={plotLeft} y1={tickY} x2={plotRight} y2={tickY} stroke="#E1E5F2" strokeWidth={1} strokeDasharray="4 5" />
              <SvgText x={s(4)} y={tickY + s(4)} fill="#9CA3AF" fontSize={s(12)} fontFamily="Inter_400Regular">{String(Math.round(tick))}</SvgText>
            </React.Fragment>
          );
        })}
        <SvgText x={s(4)} y={plotTop - s(12)} fill="#EF6B6B" fontSize={s(11)} fontWeight="700">Score↑</SvgText>
        <SvgText x={s(4)} y={plotBottom - s(8)} fill="#59B94B" fontSize={s(11)} fontWeight="700">Score↓</SvgText>
        <Line x1={plotLeft} y1={plotBottom} x2={plotRight} y2={plotBottom} stroke="#DDE1EA" strokeWidth={1} />
        <Polyline points={polylinePoints} fill="none" stroke={lineColor} strokeWidth={s(2.5)} strokeLinejoin="round" strokeLinecap="round" />
        {[previousIndex, latestIndex].map((index) => (
          <Line key={`guide-${index}`} x1={x(index)} y1={s(8)} x2={x(index)} y2={plotBottom} stroke="#B7C0F6" strokeWidth={s(2)} strokeDasharray="6 6" />
        ))}
        {points.map((point, index) => {
          const isPrevious = index === previousIndex;
          const isLatest = index === latestIndex;
          const pointX = x(index);
          const pointY = y(point.score);
          const showBubble = selectedIndex === null ? isPrevious || isLatest : selectedIndex === index;
          const bubbleLabel = isLatest ? 'Latest' : isPrevious ? 'Previous' : `Score ${index + 1}`;
          const bubbleWidth = s(Math.min(104, Math.max(76, 42 + String(point.score).length * 8 + bubbleLabel.length * 3)));
          const bubbleHeight = s(52);
          const pointsAreClose = Math.abs(x(latestIndex) - x(previousIndex)) < bubbleWidth + s(24);
          const preferredX = isPrevious && pointsAreClose
            ? pointX - bubbleWidth - s(12)
            : isLatest && pointsAreClose
            ? pointX + s(12)
            : pointX - bubbleWidth / 2;
          const bubbleX = Math.max(plotLeft, Math.min(preferredX, chartWidth - bubbleWidth));
          const bubbleAbove = pointY - bubbleHeight - s(14) >= s(4);
          const bubbleY = bubbleAbove ? pointY - bubbleHeight - s(14) : Math.min(pointY + s(14), plotBottom - bubbleHeight);
          const connectorX = Math.max(bubbleX + s(12), Math.min(pointX, bubbleX + bubbleWidth - s(12)));
          const showDate = selectedIndex === index || index === 0 || isPrevious || isLatest;
          const datesAreClose = Math.abs(x(latestIndex) - x(previousIndex)) < s(110);
          const nearLeftEdge = pointX < s(76);
          const nearRightEdge = pointX > chartWidth - s(76);
          const dateAnchor = nearLeftEdge ? 'start' : nearRightEdge ? 'end' : datesAreClose && isPrevious ? 'end' : datesAreClose && isLatest ? 'start' : 'middle';
          const dateX = nearLeftEdge ? pointX : nearRightEdge ? pointX : datesAreClose && isPrevious ? pointX - s(6) : datesAreClose && isLatest ? pointX + s(6) : pointX;
          const dateText = dateLabel(point);
          const datePillWidth = s(Math.max(52, Math.min(92, dateText.length * 5.6 + 18)));
          const datePillPreferredX = pointX - datePillWidth / 2;
          const datePillX = Math.max(s(2), Math.min(datePillPreferredX, chartWidth - datePillWidth - s(2)));
          const dateY = plotBottom + s(28) + (datesAreClose && isLatest ? s(32) : 0);
          const datePillY = dateY;
          return (
            <React.Fragment key={`${point.score}-${index}`}>
              {showBubble && (
                <>
                  <Line
                    x1={connectorX}
                    y1={bubbleAbove ? bubbleY + bubbleHeight : bubbleY}
                    x2={pointX}
                    y2={pointY}
                    stroke={isLatest ? (improved ? '#1A7340' : lineColor) : '#5664DD'}
                    strokeWidth={s(3)}
                  />
                  <Rect x={bubbleX} y={bubbleY} width={bubbleWidth} height={bubbleHeight} rx={s(12)} fill={isLatest ? (improved ? '#1A7340' : lineColor) : '#5664DD'} />
                  <Polygon
                    points={bubbleAbove
                      ? `${connectorX - s(8)},${bubbleY + bubbleHeight - s(1)} ${connectorX + s(8)},${bubbleY + bubbleHeight - s(1)} ${pointX},${pointY - s(2)}`
                      : `${connectorX - s(8)},${bubbleY + s(1)} ${connectorX + s(8)},${bubbleY + s(1)} ${pointX},${pointY + s(2)}`}
                    fill={isLatest ? (improved ? '#1A7340' : lineColor) : '#5664DD'}
                  />
                  <SvgText x={bubbleX + bubbleWidth / 2} y={bubbleY + s(18)} textAnchor="middle" fill="#FFFFFF" fontSize={s(10)} fontFamily="Inter_700Bold">{bubbleLabel}</SvgText>
                  <SvgText x={bubbleX + bubbleWidth / 2} y={bubbleY + s(41)} textAnchor="middle" fill="#FFFFFF" fontSize={s(19)} fontFamily="Inter_800ExtraBold">{String(point.score)}</SvgText>
                </>
              )}
              <Circle
                cx={pointX}
                cy={pointY}
                r={isPrevious || isLatest ? s(8) : s(5)}
                fill={isLatest ? (improved ? '#1A7340' : lineColor) : '#FFFFFF'}
                stroke={lineColor}
                strokeWidth={s(2.5)}
                onPress={() => setSelectedIndex(selectedIndex === index ? null : index)}
              />
              {showDate ? (
                isPrevious || isLatest ? (
                  <>
                    <Rect x={datePillX} y={datePillY - s(14)} width={datePillWidth} height={s(28)} rx={s(10)} fill="#EEF0FF" />
                    <SvgText x={datePillX + datePillWidth / 2} y={datePillY + s(4)} textAnchor="middle" fill="#5664DD" fontSize={s(9)} fontFamily="Inter_700Bold">{dateText}</SvgText>
                  </>
                ) : (
                  <SvgText x={dateX} y={dateY} textAnchor={dateAnchor} fill="#9CA3AF" fontSize={s(9)} fontFamily="Inter_400Regular">{dateText}</SvgText>
                )
              ) : null}
            </React.Fragment>
          );
        })}
      </Svg>

      <View style={[styles.summary, { backgroundColor: improved ? '#E8F7F0' : trendBg, borderRadius: s(18), paddingHorizontal: s(14), paddingVertical: s(12) }]}>
        <Text style={[styles.summaryPercent, { backgroundColor: improved ? '#1A7340' : lineColor, borderRadius: s(12), paddingHorizontal: s(10), paddingVertical: s(6), fontSize: s(13) }]}>
          {unchanged ? '— 0%' : `${improved ? '↓' : '↑'} ${percent}%`}
        </Text>
        <Text style={[styles.summaryText, { fontSize: s(13) }]}>
          {unchanged ? 'No change between scores' : `${improved ? 'Improvement' : 'Change'} since ${dateLabel(points[previousIndex])}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: '#DDE1EA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontFamily: 'Inter_700Bold', color: '#2D2A3A' },
  badge: { flexDirection: 'row', alignItems: 'center' },
  badgeText: { fontFamily: 'Inter_700Bold' },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  summaryPercent: { color: '#FFFFFF', fontFamily: 'Inter_700Bold' },
  summaryText: { flex: 1, color: '#2D2A3A', fontFamily: 'Inter_700Bold' },
});

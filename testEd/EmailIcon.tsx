import { View, StyleSheet } from "react-native";
import Svg, { Circle, Path, Rect, SvgProps } from "react-native-svg";

type MailIconProps = {
  size?: number;
  badgeColor?: string;
  symbol?: string;
};

export function MailIcon({
  size = 250,
  badgeColor = "#C6933C",
  symbol = "?",
}: MailIconProps) {
  const envelopeColors = {
    back: "#D8BE89",
    left: "#CDAF76",
    right: "#C4A46C",
    front: "#D3B77E",
  };
  const VIEWBOX_SIZE = 250;
  const svgCenterX = VIEWBOX_SIZE / 2;
  const svgCenterY = VIEWBOX_SIZE / 2;

  // medidas del sobre

  const envelopeWidth = 120;
  const envelopeHeight = 80;

  const envelopeX = svgCenterX - envelopeWidth / 2;
  const envelopeY = 85;

  const envelopeLeft = envelopeX;
  const envelopeRight = envelopeX + envelopeWidth;
  const envelopeBottom = envelopeY + envelopeHeight;

  const envelopeCenterX = envelopeX + envelopeWidth / 2;
  const envelopeCenterY = envelopeY + envelopeHeight / 2;

  /// medidas de la carta

  const paperWidth = 100;
  const paperHeight = 90;

  const paperX = svgCenterX - paperWidth / 2;
  const paperY = 40;

  const frontFlapTipY = 100;
  const frontFlapBottomY = 142;
  const frontFlapHalfWidth = 40;
  const innerFlapTipY = 115;

  const backFlapTopY = 20;

  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: "blue",
      }}
    >
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      >
        <Path
          d={`
            M ${envelopeLeft + 10} ${envelopeY + 10}
            Q 65 93 68 85
            L ${envelopeCenterX - 6} ${backFlapTopY}
            Q 122 18 125 20
            L 182 85
            Q 185 93 180 95
            Z
          `}
          fill={envelopeColors.back}
          stroke="#e2bd6c"
          strokeWidth={3}
        />
        <Rect
          width={100}
          height={100}
          x={size / 2 - 100 / 2}
          y={size / 2 - 130 / 2}
          rx={4}
          ry={4}
          fill={"#FFFDF6"}
        />

        <Path
          d={`
            M 65 92
            Q 65 88 70 90
            L ${envelopeCenterX} ${innerFlapTipY}
            L ${envelopeRight - 6} ${envelopeY + 5} 
            Q  185 88 185 90
            L ${envelopeRight} ${envelopeBottom - 20}
            Q 185 162 165 165
            L ${envelopeLeft + 40} ${envelopeBottom}
            Q 65 165 65 150
            L 65 92
            Z
          `}
          fill={envelopeColors.front}
          stroke="#f2cb77"
          strokeWidth={2}
          filter="url(#shadow)"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <Path
          d={`
            M ${envelopeCenterX - frontFlapHalfWidth} ${frontFlapBottomY - 10}
            L ${envelopeCenterX} ${frontFlapTipY}
            L ${envelopeCenterX + frontFlapHalfWidth} ${frontFlapBottomY - 10}
          `}
          fill="none"
          stroke="#e2bd6c"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
        <Path
          d={`
            M ${envelopeCenterX - frontFlapHalfWidth} ${frontFlapBottomY - 10}
            L ${envelopeCenterX} ${frontFlapTipY}
            L ${envelopeCenterX + frontFlapHalfWidth} ${frontFlapBottomY - 10}
          `}
          fill={envelopeColors.front}
          stroke="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
        />
      </Svg>
    </View>
  );
}




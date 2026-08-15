import { View, Text } from "react-native";
import { HeroCards } from "../../../components/Advisors/HeroCards";
import { formatCurrency } from "@/lib/utils";

type HeroCardsSectionProps = {
  operationMode: string;
  area: "adviser" | "coordinator";
  rentSummary: { propertyCount: number; opportunityAmount: number };
  saleSummary: { propertyCount: number; opportunityAmount: number };
  onOpenRent: () => void;
  onOpenSale: () => void;
  heroColors: any;
  styles: any;
};

export function HeroCardsSection({
  operationMode,
  area,
  rentSummary,
  saleSummary,
  onOpenRent,
  onOpenSale,
  heroColors,
  styles,
}: HeroCardsSectionProps) {
  const activeHeroColors =
    operationMode === "sale" ? heroColors.sale : heroColors.rent;
  const activeHeroSummary =
    operationMode === "sale"
      ? saleSummary.propertyCount
      : rentSummary.propertyCount;
  const activeOpportunityAmount =
    operationMode === "sale"
      ? saleSummary.opportunityAmount
      : rentSummary.opportunityAmount;

  return (
    <View style={styles.heroCards}>
      {operationMode === "both" ? (
        <>
          <HeroCards
            Summary={rentSummary.propertyCount}
            OnPress={onOpenRent}
            colors={heroColors.rent}
          />
          <HeroCards
            Summary={saleSummary.propertyCount}
            OnPress={onOpenSale}
            colors={heroColors.sale}
          />
        </>
      ) : (
        <>
          <HeroCards
            OnPress={operationMode === "sale" ? onOpenSale : onOpenRent}
            Summary={activeHeroSummary}
            colors={activeHeroColors}
          />
        </>
      )}
      {area === "coordinator" ? (
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>OPORTUNIDAD DEL MES</Text>
          <View style={styles.earningsValueRow}>
            <Text
              style={styles.earningsValue}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
            >
              {formatCurrency(activeOpportunityAmount)}
            </Text>
            <Text style={styles.currency}>MXN</Text>
          </View>
          <Text style={styles.earningsCaption}>Comision aprox.</Text>
        </View>
      ) : null}
    </View>
  );
}

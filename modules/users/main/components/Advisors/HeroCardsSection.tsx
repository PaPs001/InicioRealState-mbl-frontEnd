import { View } from "react-native";
import { HeroCards } from "./HeroCards";
// Legacy opportunity card: import { formatCurrency } from "@/lib/utils";

type HeroCardsSectionProps = {
  operationMode: string;
  area: "adviser" | "coordinator";
  rentSummary: { propertyCount: number | null; /* opportunityAmount: number; */ };
  saleSummary: { propertyCount: number | null; /* opportunityAmount: number; */ };
  onOpenRent: () => void;
  onOpenSale: () => void;
  heroColors: any;
  styles: any;
};

export function HeroCardsSection({
  operationMode,
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
  /* Legacy: opportunity amount is currently disabled.
  const activeOpportunityAmount =
    operationMode === "sale"
      ? saleSummary.opportunityAmount
      : rentSummary.opportunityAmount;
  */
  return (
    <View style={styles.heroCards}>
      {operationMode === "both" ? (
        <>
          <HeroCards
            Summary={rentSummary.propertyCount}
            OnPress={onOpenRent}
            colors={heroColors.rent}
            titleLabel={"RENTAS"}
          />
          <HeroCards
            Summary={saleSummary.propertyCount}
            OnPress={onOpenSale}
            colors={heroColors.sale}
            titleLabel="MERCADO ABIERTO"
          />
        </>
      ) : (
        <>
          <HeroCards
            OnPress={operationMode === "sale" ? onOpenSale : onOpenRent}
            Summary={activeHeroSummary}
            colors={activeHeroColors}
            titleLabel={
              operationMode === "sale" ? "MERCADO ABIERTO" : "RENTAS"
            }
          />
        </>
      )}
      {/*{area === "coordinator" ? (
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
      ) : null}*/}
    </View>
  );
}

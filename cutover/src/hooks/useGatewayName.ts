import { useControlPlaneStore } from "../store/control-plane";

export const useGatewayName = () => useControlPlaneStore((s) => s.sourceGatewayName);

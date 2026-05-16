import EtherfuseRampDevClient from '../../dev/etherfuse-ramp/etherfuse-ramp-dev-client'

/** Paso 2: monto y generación de datos SPEI (misma lógica onramp que antes). */
export default function AnadirMontoPage() {
  return <EtherfuseRampDevClient anadirScreen="deposit" />
}

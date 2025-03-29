import { gql } from 'graphql-tag';

export const QUERY_NODE = gql`
query nodeByName($chainId: String!, $cohortId: Int!, $stash: String!) {
  nodeByStash(chainId:$chainId, cohortId:$cohortId, stash: $stash){
    identity
    stash
    commission
    status
    telemetry
    telemetryX {
      NodeName
      NodeSysInfo {
        memory
        core_count
        linux_kernel
        linux_distro
        is_virtual_machine
      }
    }
  }
  # dn nominators
  nominators(chainId: $chainId, cohortId: $cohortId)
}`

/**
 * Get DM Nominators for chain, cohort
 * @param chainId - The chain ID
 * @param cohortId - The cohort ID
 * @returns The DM nominators for the given chain and cohort
 */
export const QUERY_DM_NOMINATORS = gql`
query dmNominators($chainId: String!, $cohortId: Int!) {
  nominators(chainId: $chainId, cohortId: $cohortId)
}`


/**
 * Get the nominators for a given stash
 * @param chainId - The chain ID
 * @param stash - The stash address
 * @returns The nominators for the given stash, and the DN nominators
 */
export const QUERY_NOMINATORS = gql`
query stakers($chainId: String!, $stash: String!, $cohortId: Int!) {
  stakersForStash(chainId:$chainId, stash: $stash) {
    address
    balance
    # targets
  }
  # dn nominators
  nominators(chainId: $chainId, cohortId: $cohortId)
}`

export const QUERY_TELEMETRY = gql`
query telemetry($chainId: String!, $identity: String!) {
  telemetryByIdentity(chainId: $chainId, identity: $identity) {
    NodeId
    NodeDetails {
      NodeName
      TelemetryName
      NodeImplementation
      NodeVersion
      NetworkId
      # OperatingSystem
      NodeSysInfo {
        cpu
        memory
        core_count
        linux_kernel
        linux_distro
        is_virtual_machine
      }
      ChainStats {
        cpu_hashrate_score
        memory_memcpy_score
        disk_sequential_write_score
        disk_random_write_score
      }
    }
  }
}`

export const QUERY_PERFORMANCE = gql`
query performance($chainId: String!, $address: String!, $number_sessions: Int) {
  performance(chainId: $chainId, address: $address, number_sessions: $number_sessions) {
    grade
    authority_inclusion
    para_authority_inclusion
    sessions_data {
      session
      is_auth
      is_para
      auth {
        aix
        sp
        ep
        ab
      }
      para {
        core
        group
        peers
        pid
        pix
      }
      para_summary {
        pt
        ca
        ab
        ev
        iv
        mv
      }
    }
  }
}`

export const QUERY_NOMINATION_STATS = gql`
query nominationStats($chainId: String!, $stash: String!) {
  nominationStats(chainId: $chainId, stash: $stash) { 
    chainId
    stash
    datehour
    active
    commission
    nom_dn
    nom_non
    nom_value_dn
    nom_value_non
    exposure_dn
    exposure_non
  }
}`

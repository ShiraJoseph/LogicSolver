import {FeatureId, OptionId} from './entities.model';

/** A set of potential options in a feature */
export type CandidateOptionSet = Set<OptionId>;

/** A map of potential option sets grouped by their features */
export type CandidateOptionSetsByFeatureIds = Map<FeatureId, CandidateOptionSet>;

/** A map of each option to its candidate map. */
export type Candidates = Map<OptionId, CandidateOptionSetsByFeatureIds>;

/** A set of features that changed during a logic pass  */
export type ChangedFeatures = Set<FeatureId>;

/** A map of each option that had its candidate sets updated during a logic pass */
export type ChangedSets = Map<OptionId, ChangedFeatures>;

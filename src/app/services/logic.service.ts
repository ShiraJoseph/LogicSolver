import {computed, inject, Service} from '@angular/core';
import {CellId, FeatureId, OptionId} from '../types/entities.model';
import {CellText} from '../types/tile.model';
import {CandidateOptionSetsByFeatureIds, Candidates, ChangedSets, Deduction} from '../types/logic.model';
import {GridStore} from '../store/store';

/** Deduces which option pairings are still possible from the Xs and Os the user entered. */
@Service()
export class LogicService {
  store = inject(GridStore);

  /** One run of the deduction rules over the values on the grid. */
  private deduction = computed(() => this.deduceCandidates());

  /**
   * Every option in the grid has a set of potential matches for every feature that is not its own.
   * Eventually each of those options in the grid will be matched (marked with an "O" in the grid) with only one other option per feature.
   * So we store a list of candidates and eliminate them one by one until we know what that matching option is in each of those features.
   */
  candidates = computed(() => this.deduction().candidates);

  /** If some option on the grid has no possible match left in a feature. */
  isContradicted = computed(() => this.deduction().isContradicted);

  /** If the pass has emptied a candidate set. */
  private hasEmptyCandidateSet = false;

  /**
   * The value the deductions give a cell: an O once one candidate is left for the pairing, an X once it is ruled
   * out, and empty while neither is settled.
   * @param cellId
   */
  deducedValue(cellId: CellId): CellText {
    const [leftOptionId, topOptionId] = this.store.cellById(cellId)!.optionIds as [OptionId, OptionId];
    const possibleTopOptions = this.candidates().get(leftOptionId)!
      .get(this.store.optionById(topOptionId)!.featureId as FeatureId)!;

    return !possibleTopOptions.has(topOptionId) ?
      CellText.X : possibleTopOptions.size === 1 ?
        CellText.O :
        CellText.EMPTY;
  }

  /**
   * Uses a process of elimination to update every option's candidate map based on user entered Xs and Os.
   * Reruns on the updated sets until no more deductions can be made with the available information,
   * or until an option runs out of candidates in some feature.
   * @private
   */
  private deduceCandidates(): Deduction {
    const candidates = this.rebuildCandidates();

    this.hasEmptyCandidateSet = false;

    let setsChangedLastPass: ChangedSets = new Map();
    this.applyUserValuesToCandidates(candidates, setsChangedLastPass);

    while (setsChangedLastPass.size > 0 && !this.hasEmptyCandidateSet) {
      const setsChangedThisPass: ChangedSets = new Map();

      this.updateCandidatesForChangedSets(candidates, setsChangedLastPass, setsChangedThisPass);

      setsChangedLastPass = setsChangedThisPass;
    }

    return {candidates, isContradicted: this.hasEmptyCandidateSet};
  }

  /**
   * Creates the initial candidate map for each option with all other options
   * @private
   */
  private rebuildCandidates(): Candidates {
    const candidates: Candidates = new Map<OptionId, CandidateOptionSetsByFeatureIds>();

    for (const option of this.store.options()) {
      const candidateOptionsByFeatureIds: CandidateOptionSetsByFeatureIds = new Map<FeatureId, Set<OptionId>>();

      for (const feature of this.store.features()) {
        if (feature.id === option.featureId) continue;
        candidateOptionsByFeatureIds.set(feature.id, new Set(this.store.optionIdsByFeature(feature.id) as Array<OptionId>));
      }

      candidates.set(option.id, candidateOptionsByFeatureIds);
    }

    return candidates;
  }

  /**
   * Uses values entered by the user to eliminate potential candidates;
   * Xs mean a simple elimination and Os mean there should be only one candidate remaining in that feature.
   * @param candidates
   * @param setsChangedLastPass
   * @private
   */
  private applyUserValuesToCandidates(candidates: Candidates, setsChangedLastPass: ChangedSets) {
    this.store.cells().forEach(cell => {
      if (cell.userValue === CellText.EMPTY) return;

      const [optionA, optionB] = cell.optionIds as [OptionId, OptionId];

      if (cell.userValue === CellText.X) {
        this.eliminate(candidates, setsChangedLastPass, optionA, optionB);
      } else {
        this.removeCandidateFromSiblings(optionB, optionA, candidates, setsChangedLastPass);
      }
    });
  }

  /**
   * Removes option A as a candidate for option B and vice versa.
   * @param candidates
   * @param setsChangedThisPass
   * @param optionA
   * @param optionB
   * @private
   */
  private eliminate(candidates: Candidates, setsChangedThisPass: ChangedSets, optionA: OptionId, optionB: OptionId) {
    const optionAFeatureId = this.store.featureIdByOption(optionA) as FeatureId;
    const optionBFeatureId = this.store.featureIdByOption(optionB) as FeatureId;
    const optionACandidatesInFeatureB = candidates.get(optionA)?.get(optionBFeatureId);

    if (!optionACandidatesInFeatureB?.has(optionB)) return;

    optionACandidatesInFeatureB.delete(optionB);
    candidates.get(optionB)?.get(optionAFeatureId)?.delete(optionA);

    if (!optionACandidatesInFeatureB.size || !candidates.get(optionB)?.get(optionAFeatureId)?.size) {
      this.hasEmptyCandidateSet = true;
    }

    (setsChangedThisPass.get(optionA) || setsChangedThisPass.set(optionA, new Set()).get(optionA))?.add(optionBFeatureId);
    (setsChangedThisPass.get(optionB) || setsChangedThisPass.set(optionB, new Set()).get(optionB))?.add(optionAFeatureId);
  }

  /**
   * Using the latest updates, checks for features that have had their candidate set reduced to 1 or their candidates' candidates updated.
   * @param candidates
   * @param setsChangedLastPass
   * @param setsChangedThisPass
   * @private
   */
  private updateCandidatesForChangedSets(candidates: Candidates, setsChangedLastPass: ChangedSets,
                                         setsChangedThisPass: ChangedSets) {
    for (let [optionA, featuresB] of setsChangedLastPass) {
      const featureA = this.store.featureIdByOption(optionA) as FeatureId;

      featuresB.forEach(featureB => {
        const optionACandidatesInFeatureB = candidates.get(optionA)?.get(featureB)!;

        if (optionACandidatesInFeatureB?.size === 1) {
          const [optionB] = [...optionACandidatesInFeatureB];
          this.removeCandidateFromSiblings(optionB, optionA, candidates, setsChangedThisPass);
        }

        this.store.featureIds().forEach(featureC => {
          if (featureC === featureB || featureC === featureA) return;
          this.eliminateSecondHandCandidates(optionACandidatesInFeatureB, candidates, featureC as FeatureId, optionA, setsChangedThisPass);
        });
      });
    }
  }

  /**
   * As soon as one option has been selected in a feature, eliminate all other candidates in that feature.
   * @param candidate
   * @param optionA
   * @param candidates
   * @param setsChangedThisPass
   * @private
   */
  private removeCandidateFromSiblings(candidate: OptionId, optionA: OptionId, candidates: Candidates, setsChangedThisPass: ChangedSets) {
    const featureA = this.store.featureIdByOption(optionA) as FeatureId;

    this.store.optionIdsByFeature(featureA).forEach((siblingOption) => {
      if (optionA !== siblingOption) {
        this.eliminate(candidates, setsChangedThisPass, siblingOption as OptionId, candidate);
      }
    });
  }

  /**
   * If option A has candidate options in feature B, and none of THOSE candidate options has some option from feature C, we remove that feature C option from A's candidates.
   * Example: Alice's Pet candidates have been narrowed down to either a dog or a cat.  Neither the cat nor the dog has a car as one of its potential candidates in the Vehicle feature, so Alice can't have a car either.
   * @param optionACandidatesInFeatureB
   * @param candidates
   * @param featureC
   * @param optionA
   * @param setsChangedThisPass
   * @private
   */
  private eliminateSecondHandCandidates(optionACandidatesInFeatureB: Set<OptionId>, candidates: Candidates,
                                        featureC: FeatureId, optionA: OptionId, setsChangedThisPass: ChangedSets) {
    let optionBCandidatesInFeatureC: Set<OptionId> = new Set();

    for (const optionB of optionACandidatesInFeatureB) {
      optionBCandidatesInFeatureC = optionBCandidatesInFeatureC.union(candidates.get(optionB)?.get(featureC as FeatureId)!);

      if (optionBCandidatesInFeatureC.size === this.store.optionCountPerFeature()) {
        return;
      }
    }

    const optionACandidatesInFeatureC = candidates.get(optionA)?.get(featureC as FeatureId);

    optionACandidatesInFeatureC?.difference(optionBCandidatesInFeatureC)?.forEach(candidate => {
      this.eliminate(candidates, setsChangedThisPass, candidate, optionA);
    });
  }
}

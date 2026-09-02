"""
Entity Resolution Module for AI-Powered Criminal Network Analysis System (SIH26189).
Performs multi-signal matching on names, phone numbers, addresses, and shared assets to resolve
duplicate or fragmented entity records into canonical Entity Records using Union-Find clustering.
"""

from typing import List, Dict, Any, Set, Tuple
from rapidfuzz import fuzz

# Tunable confidence threshold for entity merging
CONFIDENCE_THRESHOLD: float = 0.70

# Feature weights for multi-signal matching
WEIGHT_NAME: float = 0.40
WEIGHT_PHONE: float = 0.30
WEIGHT_ADDRESS: float = 0.20
WEIGHT_ASSETS: float = 0.10

# Maximum confidence score returned when first names are clearly incompatible
# (e.g. "Priya Nair" vs "Anil Nair" — same household, but provably different people)
INCOMPATIBLE_NAME_CAP: float = 0.20



def calculate_name_similarity(name1: str, name2: str) -> float:
    """
    Computes name similarity taking into account full string similarity, token sorting,
    and initial/abbreviation matching (e.g. 'R. Kumar' vs 'Rajesh Kumar', 'Rajesh K.' vs 'Rajesh Kumar').
    """
    if not name1 or not name2:
        return 0.0

    n1 = str(name1).strip().lower()
    n2 = str(name2).strip().lower()

    if n1 == n2:
        return 1.0

    # Base token ratios
    ts_ratio = fuzz.token_sort_ratio(n1, n2) / 100.0
    tset_ratio = fuzz.token_set_ratio(n1, n2) / 100.0
    base_sim = max(ts_ratio, tset_ratio)

    tokens1 = [t.strip(".") for t in n1.split() if t.strip(".")]
    tokens2 = [t.strip(".") for t in n2.split() if t.strip(".")]

    if len(tokens1) >= 2 and len(tokens2) >= 2:
        last1, last2 = tokens1[-1], tokens2[-1]
        first1, first2 = tokens1[0], tokens2[0]

        # Check surname compatibility (exact, initial, or high string similarity)
        is_last_match = False
        if last1 == last2:
            is_last_match = True
        elif len(last1) == 1 and last2.startswith(last1):
            is_last_match = True
        elif len(last2) == 1 and last1.startswith(last2):
            is_last_match = True
        elif fuzz.ratio(last1, last2) / 100.0 >= 0.85:
            is_last_match = True

        # Check first name compatibility (exact, initial, prefix, or high string similarity)
        is_first_match = False
        if first1 == first2:
            is_first_match = True
        elif len(first1) == 1 and first2.startswith(first1):
            is_first_match = True
        elif len(first2) == 1 and first1.startswith(first2):
            is_first_match = True
        elif first1.startswith(first2) or first2.startswith(first1):
            is_first_match = True
        elif fuzz.ratio(first1, first2) / 100.0 >= 0.85:
            is_first_match = True

        if is_first_match and is_last_match:
            return max(base_sim, 0.88)
        elif not is_last_match and len(last1) > 1 and len(last2) > 1:
            # Surnames are explicitly different (e.g. 'kumar' vs 'kapoor') -> suppress similarity
            surname_sim = fuzz.ratio(last1, last2) / 100.0
            base_sim = base_sim * surname_sim

    return base_sim


def calculate_attribute_similarity(attr1: Dict[str, Any], attr2: Dict[str, Any]) -> Tuple[float, float, float]:
    """
    Computes similarity scores for phone numbers, addresses, and shared assets.
    Returns (phone_score, address_score, asset_score).
    """
    # 1. Phone Matching
    phones1 = attr1.get("phones", []) or ([attr1["phone"]] if "phone" in attr1 and attr1["phone"] else [])
    phones2 = attr2.get("phones", []) or ([attr2["phone"]] if "phone" in attr2 and attr2["phone"] else [])

    phones1_clean = {"".join(filter(str.isdigit, str(p))) for p in phones1 if p}
    phones2_clean = {"".join(filter(str.isdigit, str(p))) for p in phones2 if p}

    phone_score = 0.0
    if phones1_clean and phones2_clean:
        if phones1_clean.intersection(phones2_clean):
            phone_score = 1.0

    # 2. Address Matching
    addresses1 = attr1.get("addresses", []) or ([attr1["address"]] if "address" in attr1 and attr1["address"] else [])
    addresses2 = attr2.get("addresses", []) or ([attr2["address"]] if "address" in attr2 and attr2["address"] else [])

    address_score = 0.0
    if addresses1 and addresses2:
        max_sim = 0.0
        for a1 in addresses1:
            for a2 in addresses2:
                sim = fuzz.token_set_ratio(str(a1).lower(), str(a2).lower()) / 100.0
                if sim > max_sim:
                    max_sim = sim
        if max_sim >= 0.75:
            address_score = max_sim

    # 3. Assets Matching (emails, bank accounts, vehicle reg, etc.)
    assets1 = set(attr1.get("assets", []) or attr1.get("emails", []) or [])
    assets2 = set(attr2.get("assets", []) or attr2.get("emails", []) or [])

    asset_score = 0.0
    if assets1 and assets2:
        if assets1.intersection(assets2):
            asset_score = 1.0

    return phone_score, address_score, asset_score


def is_first_name_compatible(name1: str, name2: str) -> bool:
    """
    Compares only the first token of each name.
    Returns True for exact match, initial-matches-prefix, prefix match, or fuzzy ratio >= 0.75.
    Returns True if either name has no tokens (insufficient data shouldn't force a block).
    """
    if not name1 or not name2:
        return True

    n1 = str(name1).strip().lower()
    n2 = str(name2).strip().lower()

    tokens1 = [t.strip(".") for t in n1.split() if t.strip(".")]
    tokens2 = [t.strip(".") for t in n2.split() if t.strip(".")]

    if not tokens1 or not tokens2:
        return True

    first1, first2 = tokens1[0], tokens2[0]

    # Exact match
    if first1 == first2:
        return True

    # Initial matches prefix (e.g. 'R.' vs 'Rajesh', or 'Rajesh' vs 'R.')
    if len(first1) == 1 and first2.startswith(first1):
        return True
    if len(first2) == 1 and first1.startswith(first2):
        return True

    # Prefix match (e.g. 'Raj' vs 'Rajesh')
    if first1.startswith(first2) or first2.startswith(first1):
        return True

    # Fuzzy ratio >= 0.75 (75%)
    fuzzy_sim = fuzz.ratio(first1, first2) / 100.0
    if fuzzy_sim >= 0.75:
        return True

    return False


def compute_multi_signal_confidence(rec1: Dict[str, Any], rec2: Dict[str, Any]) -> float:
    """
    Combines name similarity and attribute similarity into a single weighted confidence score.
    """
    name1 = rec1.get("canonical_name") or rec1.get("name", "")
    name2 = rec2.get("canonical_name") or rec2.get("name", "")

    attr1 = dict(rec1.get("attributes", {}) or {})
    attr2 = dict(rec2.get("attributes", {}) or {})

    # Pull top-level attribute shortcuts if present
    for k in ["phone", "phones", "address", "addresses", "assets", "emails"]:
        if k in rec1 and k not in attr1:
            attr1[k] = rec1[k]
        if k in rec2 and k not in attr2:
            attr2[k] = rec2[k]

    name_score = calculate_name_similarity(name1, name2)
    phone_score, address_score, asset_score = calculate_attribute_similarity(attr1, attr2)

    # First-name compatibility gate: short-circuit if first names are clearly incompatible
    if not is_first_name_compatible(name1, name2):
        return round(min(name_score, INCOMPATIBLE_NAME_CAP), 4)


    has_phone_data = bool(attr1.get("phones") or attr1.get("phone")) and bool(attr2.get("phones") or attr2.get("phone"))
    has_addr_data = bool(attr1.get("addresses") or attr1.get("address")) and bool(attr2.get("addresses") or attr2.get("address"))
    has_asset_data = bool(attr1.get("assets")) and bool(attr2.get("assets"))

    # Negative signal penalty: attributes are present for both entities, but NONE match
    if (has_phone_data or has_addr_data or has_asset_data):
        if phone_score == 0.0 and address_score == 0.0 and asset_score == 0.0:
            return round(name_score * 0.35, 4)

    # Weighted combination
    total_score = (
        name_score * WEIGHT_NAME +
        phone_score * WEIGHT_PHONE +
        address_score * WEIGHT_ADDRESS +
        asset_score * WEIGHT_ASSETS
    )

    return round(total_score, 4)


class DisjointSetUnion:
    """Union-Find helper class for grouping matching entity indices."""
    def __init__(self, n: int):
        self.parent = list(range(n))

    def find(self, i: int) -> int:
        if self.parent[i] == i:
            return i
        self.parent[i] = self.find(self.parent[i])
        return self.parent[i]

    def union(self, i: int, j: int):
        root_i = self.find(i)
        root_j = self.find(j)
        if root_i != root_j:
            self.parent[root_i] = root_j


def resolve_entities(records: List[Dict[str, Any]], threshold: float = CONFIDENCE_THRESHOLD) -> List[Dict[str, Any]]:
    """
    Resolves a list of entity records into canonical Entity Records.
    
    Data Contract Schema:
    {
      "entity_id": "P042",
      "entity_type": "person",
      "canonical_name": "Rajesh Kumar",
      "aliases": ["R. Kumar", "Raj Kumar"],
      "attributes": {},
      "confidence": 0.94
    }
    """
    n = len(records)
    if n == 0:
        return []

    dsu = DisjointSetUnion(n)
    pair_confidence: Dict[Tuple[int, int], float] = {}

    for i in range(n):
        for j in range(i + 1, n):
            conf = compute_multi_signal_confidence(records[i], records[j])
            pair_confidence[(i, j)] = conf
            if conf >= threshold:
                dsu.union(i, j)

    # Group records by root parent
    clusters: Dict[int, List[int]] = {}
    for i in range(n):
        root = dsu.find(i)
        clusters.setdefault(root, []).append(i)

    resolved_entities: List[Dict[str, Any]] = []

    for cluster_idx, (root, indices) in enumerate(clusters.items(), start=1):
        cluster_recs = [records[i] for i in indices]

        all_names: Set[str] = set()
        for r in cluster_recs:
            for name_field in ["canonical_name", "name"]:
                if r.get(name_field):
                    all_names.add(str(r[name_field]).strip())
            for alias in r.get("aliases", []):
                if alias:
                    all_names.add(str(alias).strip())

        # Select canonical name (longest/most detailed name)
        sorted_names = sorted(list(all_names), key=lambda x: len(x), reverse=True)
        canonical_name = sorted_names[0] if sorted_names else "Unknown Entity"
        aliases = [name for name in sorted_names if name != canonical_name]

        # Merge attributes
        merged_attributes: Dict[str, Any] = {}
        phones: Set[str] = set()
        addresses: Set[str] = set()
        assets: Set[str] = set()

        for r in cluster_recs:
            attrs = r.get("attributes", {}) or {}
            # Phones
            for p in attrs.get("phones", []) or ([attrs["phone"]] if "phone" in attrs and attrs["phone"] else []) or ([r["phone"]] if "phone" in r and r["phone"] else []):
                phones.add(str(p))
            # Addresses
            for a in attrs.get("addresses", []) or ([attrs["address"]] if "address" in attrs and attrs["address"] else []) or ([r["address"]] if "address" in r and r["address"] else []):
                addresses.add(str(a))
            # Assets
            for ast in attrs.get("assets", []):
                assets.add(str(ast))
            # Other custom attributes
            for k, v in attrs.items():
                if k not in ["phones", "addresses", "assets", "phone", "address"]:
                    merged_attributes[k] = v

        if phones:
            merged_attributes["phones"] = sorted(list(phones))
        if addresses:
            merged_attributes["addresses"] = sorted(list(addresses))
        if assets:
            merged_attributes["assets"] = sorted(list(assets))

        entity_id = cluster_recs[0].get("entity_id") or f"P{cluster_idx:03d}"
        entity_type = cluster_recs[0].get("entity_type", "person")

        if len(indices) == 1:
            confidence = float(cluster_recs[0].get("confidence", 1.0))
        else:
            confs = []
            for i_idx in range(len(indices)):
                for j_idx in range(i_idx + 1, len(indices)):
                    idx1, idx2 = sorted((indices[i_idx], indices[j_idx]))
                    confs.append(pair_confidence.get((idx1, idx2), threshold))
            confidence = round(sum(confs) / len(confs), 2) if confs else 1.0

        resolved_entities.append({
            "entity_id": entity_id,
            "entity_type": entity_type,
            "canonical_name": canonical_name,
            "aliases": aliases,
            "attributes": merged_attributes,
            "confidence": confidence
        })

    return resolved_entities

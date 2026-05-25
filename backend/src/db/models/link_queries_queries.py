import dataclasses
import uuid


@dataclasses.dataclass
class GetlinkscountbyuseridRow:
    count: int

@dataclasses.dataclass
class DeletelinkRow:
    id: uuid.UUID

@dataclasses.dataclass
class ChecklinkexistsRow:
    exists: bool

Use Cases
=========

..  _use-cases:

For most apps, the Graph Protocol is a good choice when wanting to make
available on-chain contract storage to HTTPS clients. On this page, however, we
are discussing use cases for Attestate's crawler that are beyond what the Graph
Protocol can do.

Self-contained chain synchronization
------------------------------------

Modern peer to peer apps like `Farcaster <https://farcaster.network>`_
implement reconciliation algorithms using on-chain identity via digital
signatures. The algorithm considers a post on Farcaster valid, if its signed by
a member address of the on-chain name registry. A hub must, hence, always
replicate the registry's contract storage accurately. It ideally does so
without integrating many moving parts or points of centralization. For a long
time, that meant building a custom event log crawler or querying the Graph
Protocol.

Attestate's crawler is an embeddable JavaScript library for rerunnable and
stage-separated data retrieval work flows. Separating extraction from
transformation and loading, means repeated network retrieval is unnecessary if
transformation or loading phases fail. Transformation work flows can be
adjusted to the extraction result and re-run.

Integrating Attestate's crawler through JavaScript, Farcaster's hub is
immediately connectable to Infura and Alchemy without risk of getting
rate-limited. A pooling algorithm prevents requests from triggering rate
limits.

Considering the scale of Farcaster's future name registry, by co-locating an
Erigon node, Farcaster's hub can synchronize the on-chain name registry at
disk-speed (GigaBytes per second!) without having to make costly network
requests.

Generating derivative data
--------------------------

The Graph Protocol is great for replicating contract storage. An entire NFT
collection's token and ownership history is made available for querying via
GraphQL. However, in many use cases, peer to peer applications require a
derived view of contract storage. For music NFT players like `Spinamp
<https://www.spinamp.xyz/>`_ or `MusicOS <https://musicos.xyz>`_, their
developers identify a list of all tracks by parsing NFT meta data. As there can
be many NFTs per track, replicating an NFT collection's contract storage is
only a stepping stone for then extracting track information.

Attestate's crawler was purpose-built for such use cases. Upon completing
extraction, developers write custom transformation and loading scripts for
deriving data. Metadata is processed, media files converted and tokens are
filtered into a list of unique tracks.

Use Cases
=========

..  _use-cases:

For most apps, the Graph Protocol is a good choice when wanting to expose
contract storage to HTTPS clients. 

But with Attestate's crawler, a tight integration into a decentralized
application's process is possible. 

The crawler allows being spun up side-to-side to node software without the
necessity of requesting calls from an external network.

Below are the use cases we're eliciting.

Self-contained chain synchronization
------------------------------------

Modern peer to peer "dapps" like `Farcaster <https://farcaster.network>`_
implement reconciliation algorithms using on-chain identity management via
digital signatures. 

Their algorithm considers a post valid, if its signed by an address registered
in the on-chain registry. This prevents denial of service attacks by increasing
a spammer's cost when signing up with the protocol.


But for that to work, a hub must always replicate the registry's storage. It
ideally does so without integrating many moving parts (e.g. through external
requests) or points of centralization. 

Attestate's Crawler is a good match for these types of applications as its
embeddable JavaScript helps the p2p app stay up to date with Ethereum's
network. Since its self-contained, it reduces the complexity of the anyhow
complex peer to peer reconciliation.

It implements stage-separated data retrieval work flows. By separating
extraction from transformation and loading, that means repeated network
retrieval of contract storage is unnecessary, even if transformation or loading
phases fail. 

Stage-separation also enables quick turn-arounds for fixing an application.
Since all extraction data is kept isolated, when it breaks the transformation
or loader pipeline, these mismatches in schema can be fixed quickly.

To retrieve Farcaster's identity registry data and to compute its NFT timeline,
Attestate Crawler could be connected to Infura and Alchemy without the risk of
getting rate-limited, as a request-pooling algorithm prevents the crawler's
worker from triggering rate limits.

Considering the scale of Farcaster's future name registry, by co-locating the
hub to an Erigon node, it can synchronize the registry at disk-speed (GigaBytes
per second!) without having to make costly network requests.

Generating derivative data
--------------------------

A second use case is that of producing derivative data with Attestate's
crawler. While the Graph Protocol is great for replicating contract storage, an
entire NFT collection's token and ownership history may not be useful for every
application.

For music NFT players like `Spinamp <https://www.spinamp.xyz/>`_ or `MusicOS
<https://musicos.xyz>`_, their backends identify a list of all unique tracks
registered on Ethereum by downloading and parsing all NFT meta data.

As there can be many NFTs per track (e.g., editions), replicating an
collection's contract storage is only a stepping stone for then extracting the
unique list of tracks. We call this "generating derivative data," as we're not
interested in the token and ownership information, but what song's it exposes.

Attestate's crawler was purpose-built for such use cases. Upon completing the
extraction phase, developers write custom transformation and loading scripts to
derive new data. Metadata is processed, media files are converted and tokens
filtered into a list of unique tracks.

# rnaSecStr.sql was originally generated by the autoSql program, which also 
# generated rnaSecStr.c and rnaSecStr.h.  This creates the database representation of
# an object which can be loaded and saved from RAM in a fairly 
# automatic way.

#Browser extensible data
CREATE TABLE evofold (
    bin smallint not null,	# Bin number for browser speedup
    chrom varchar(255) not null,	# Chromosome or FPC contig
    chromStart int unsigned not null,	# Start position in chromosome
    chromEnd int unsigned not null,	# End position in chromosome
    name varchar(255) not null,	# Name of item
    score int unsigned not null,	# Score from 0-1000
    strand char(1) not null,	# + or -
    size int unsigned not null,	# Size of element.
    secStr longblob not null,	# Parentheses and '.'s which define the secondary structure
    conf longblob not null,	# Confidence of secondary-structure annotation per position (0.0-1.0).
              #Indices
    INDEX(name(16)),
    INDEX(chrom(8), bin),
    INDEX(chrom(8), chromStart)
);
